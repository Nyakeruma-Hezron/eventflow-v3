from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import Booking
from .serializers import BookingSerializer, CreateBookingSerializer
from .utils import generate_booking_qr
from apps.events.models import Event, TicketType
import logging

logger = logging.getLogger('apps.bookings')


class BookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related('event', 'ticket_type').order_by('-created_at')


class BookingDetailView(generics.RetrieveAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'reference'

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)


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
        if event.available_tickets < quantity:
            return Response({'detail': f'Only {event.available_tickets} ticket(s) remaining.'}, status=status.HTTP_400_BAD_REQUEST)

        ticket_type = None
        unit_price = event.base_price

        if data.get('ticket_type_id'):
            ticket_type = get_object_or_404(TicketType.objects.select_for_update(), id=data['ticket_type_id'], event=event, is_active=True)
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

        event.available_tickets -= quantity
        event.bookings_count += quantity
        event.save(update_fields=['available_tickets', 'bookings_count'])

        if ticket_type:
            ticket_type.quantity_sold += quantity
            ticket_type.save(update_fields=['quantity_sold'])

        # Free events confirm immediately
        if float(total_amount) == 0:
            booking.status = Booking.Status.CONFIRMED
            booking.confirmed_at = timezone.now()
            booking.save(update_fields=['status', 'confirmed_at'])
            generate_booking_qr(booking)

        logger.info(f'Booking created: {booking.reference}')
        return Response(BookingSerializer(booking, context={'request': request}).data, status=status.HTTP_201_CREATED)


class CancelBookingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, reference):
        booking = get_object_or_404(Booking, reference=reference, user=request.user, status=Booking.Status.CONFIRMED)

        if booking.event.start_date <= timezone.now():
            return Response({'detail': 'Cannot cancel past events.'}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = Booking.Status.CANCELLED
        booking.cancelled_at = timezone.now()
        booking.cancellation_reason = request.data.get('reason', '')
        booking.save()

        booking.event.available_tickets += booking.quantity
        booking.event.bookings_count = max(0, booking.event.bookings_count - booking.quantity)
        booking.event.save(update_fields=['available_tickets', 'bookings_count'])

        return Response(BookingSerializer(booking, context={'request': request}).data)
