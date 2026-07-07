from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import Booking
from .serializers import BookingSerializer, CreateBookingSerializer
from .tasks import generate_booking_qr_task
from apps.events.models import Event, TicketType
import logging

logger = logging.getLogger('apps.bookings')


class BookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related(
            'event__organizer', 'event__category', 'event__venue', 'ticket_type'
        ).order_by('-created_at')


class BookingDetailView(generics.RetrieveAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'reference'

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related(
            'event__organizer', 'event__category', 'event__venue', 'ticket_type'
        )


class CreateBookingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CreateBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        event = get_object_or_404(Event.objects.select_for_update(), slug=data['event_slug'], status='published')

        if not event.is_available:
            return Response({'detail': 'Event is not available for booking.'}, status=status.HTTP_400_BAD_REQUEST)

        quantity = data['quantity']
        if quantity < event.min_tickets_per_booking or quantity > event.max_tickets_per_booking:
            return Response(
                {'detail': f'Booking quantity must be between {event.min_tickets_per_booking} and {event.max_tickets_per_booking}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if event.available_tickets < quantity:
            return Response({'detail': f'Only {event.available_tickets} ticket(s) remaining.'}, status=status.HTTP_400_BAD_REQUEST)

        ticket_type = None
        unit_price = event.base_price

        if data.get('ticket_type_id'):
            ticket_type = get_object_or_404(
                TicketType.objects.select_for_update(),
                id=data['ticket_type_id'],
                event=event,
                is_active=True,
            )
            if ticket_type.quantity_available < quantity:
                return Response({'detail': 'Not enough tickets of this type.'}, status=status.HTTP_400_BAD_REQUEST)
            unit_price = ticket_type.price

        total_amount = quantity * unit_price
        service_fee = round(float(total_amount) * 0.03, 2) if float(total_amount) > 0 else 0

        booking = Booking.objects.create(
            user=request.user,
            event=event,
            ticket_type=ticket_type,
            quantity=quantity,
            unit_price=unit_price,
            total_amount=total_amount,
            service_fee=service_fee,
            attendee_name=request.user.get_full_name(),
            attendee_email=request.user.email,
            attendee_phone=data.get('attendee_phone', request.user.phone),
            status=Booking.Status.PENDING,
        )

        event_update_count = Event.objects.filter(pk=event.pk, available_tickets__gte=quantity).update(
            available_tickets=F('available_tickets') - quantity,
            bookings_count=F('bookings_count') + quantity,
        )
        if event_update_count != 1:
            raise ValueError('Ticket inventory was updated by another process. Please retry.')

        if ticket_type:
            ticket_type_update_count = TicketType.objects.filter(pk=ticket_type.pk, quantity__gte=F('quantity_sold') + quantity).update(
                quantity_sold=F('quantity_sold') + quantity,
            )
            if ticket_type_update_count != 1:
                raise ValueError('Ticket type inventory was updated by another process. Please retry.')

        if float(total_amount) == 0:
            booking.status = Booking.Status.CONFIRMED
            booking.confirmed_at = timezone.now()
            booking.save(update_fields=['status', 'confirmed_at'])
            transaction.on_commit(lambda: generate_booking_qr_task.delay(str(booking.id)))

        logger.info(f'Booking created: {booking.reference} user={request.user.email} event={event.slug} quantity={quantity}')
        return Response(BookingSerializer(booking, context={'request': request}).data, status=status.HTTP_201_CREATED)


class CancelBookingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, reference):
        booking = get_object_or_404(
            Booking.objects.select_for_update().select_related('event'),
            reference=reference,
            user=request.user,
            status=Booking.Status.CONFIRMED,
        )

        if booking.event.start_date <= timezone.now():
            return Response({'detail': 'Cannot cancel past events.'}, status=status.HTTP_400_BAD_REQUEST)

        event = Event.objects.select_for_update().get(pk=booking.event.pk)

        booking.status = Booking.Status.CANCELLED
        booking.cancelled_at = timezone.now()
        booking.cancellation_reason = request.data.get('reason', '')
        booking.save(update_fields=['status', 'cancelled_at', 'cancellation_reason'])

        event.available_tickets = F('available_tickets') + booking.quantity
        event.bookings_count = F('bookings_count') - booking.quantity
        event.save(update_fields=['available_tickets', 'bookings_count'])

        logger.info(f'Booking cancelled: {booking.reference} user={request.user.email}')
        booking.refresh_from_db()
        return Response(BookingSerializer(booking, context={'request': request}).data)
