import json
import logging
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import F
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils import timezone
from django.utils.decorators import method_decorator
from .models import Payment
from .serializers import PaymentSerializer, InitiatePaymentSerializer
from .utils import initiate_stk_push
from apps.bookings.models import Booking
from apps.bookings.tasks import generate_booking_qr_task
from apps.events.models import Event

logger = logging.getLogger('apps.payments')


class InitiatePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        idempotency_key = data.get('idempotency_key')

        try:
            booking = Booking.objects.select_for_update().get(
                reference=data['booking_reference'], user=request.user, status='pending'
            )
        except Booking.DoesNotExist:
            return Response({'detail': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

        payment, created = Payment.objects.get_or_create(
            booking=booking,
            defaults={
                'user': request.user,
                'amount': booking.grand_total,
                'method': 'mpesa',
                'status': 'pending',
                'idempotency_key': idempotency_key,
            },
        )

        if not created and idempotency_key and payment.idempotency_key is None:
            payment.idempotency_key = idempotency_key
            payment.save(update_fields=['idempotency_key'])

        if payment.status in [Payment.Status.COMPLETED, Payment.Status.PROCESSING]:
            return Response({
                'payment_id': str(payment.id),
                'checkout_request_id': payment.mpesa_checkout_id,
                'message': 'Existing payment is already in progress.',
            })

        try:
            resp = initiate_stk_push(
                phone=data['phone'],
                amount=float(booking.grand_total),
                reference=booking.reference,
                description=f'EventFlow {booking.reference}',
            )
            payment.mpesa_phone = data['phone']
            payment.mpesa_checkout_id = resp.get('CheckoutRequestID', '')
            payment.status = Payment.Status.PROCESSING
            payment.gateway_response = resp
            payment.save(update_fields=['mpesa_phone', 'mpesa_checkout_id', 'status', 'gateway_response'])
            return Response({
                'payment_id': str(payment.id),
                'checkout_request_id': resp.get('CheckoutRequestID'),
                'message': 'STK Push sent. Enter your M-Pesa PIN.',
            })
        except Exception as e:
            logger.error(f'STK Push error: {e}', exc_info=True)
            return Response({'detail': 'Payment initiation failed. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)


class PaymentStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, payment_id):
        try:
            payment = Payment.objects.select_related('booking').get(id=payment_id, user=request.user)
        except Payment.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({
            'status': payment.status,
            'booking_reference': payment.booking.reference,
        })


@method_decorator(csrf_exempt, name='dispatch')
class MpesaCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        try:
            body = json.loads(request.body)
            stk = body.get('Body', {}).get('stkCallback', {})
            checkout_id = stk.get('CheckoutRequestID')
            result_code = str(stk.get('ResultCode', ''))
            result_desc = stk.get('ResultDesc', '')

            if not checkout_id:
                return JsonResponse({'ResultCode': 0, 'ResultDesc': 'Accepted'})

            payment = Payment.objects.select_for_update().filter(mpesa_checkout_id=checkout_id).first()
            if not payment:
                return JsonResponse({'ResultCode': 0, 'ResultDesc': 'Accepted'})

            if payment.status == Payment.Status.COMPLETED:
                return JsonResponse({'ResultCode': 0, 'ResultDesc': 'Accepted'})

            if result_code == '0':
                items = {i['Name']: i.get('Value') for i in stk.get('CallbackMetadata', {}).get('Item', [])}
                payment.status = Payment.Status.COMPLETED
                payment.mpesa_receipt_number = items.get('MpesaReceiptNumber', '')
                payment.paid_at = timezone.now()
                payment.gateway_response = body
                payment.save(update_fields=['status', 'mpesa_receipt_number', 'paid_at', 'gateway_response'])

                booking = Booking.objects.select_for_update().get(pk=payment.booking_id)
                booking.status = Booking.Status.CONFIRMED
                booking.confirmed_at = timezone.now()
                booking.save(update_fields=['status', 'confirmed_at'])
                transaction.on_commit(lambda: generate_booking_qr_task.delay(str(booking.id)))
            else:
                payment.status = Payment.Status.FAILED
                payment.failure_reason = result_desc
                payment.gateway_response = body
                payment.save(update_fields=['status', 'failure_reason', 'gateway_response'])

                booking = Booking.objects.select_for_update().get(pk=payment.booking_id)
                if booking.status == Booking.Status.PENDING:
                    booking.status = Booking.Status.CANCELLED
                    booking.cancellation_reason = result_desc
                    booking.cancelled_at = timezone.now()
                    booking.save(update_fields=['status', 'cancellation_reason', 'cancelled_at'])

                    event = Event.objects.select_for_update().get(pk=booking.event_id)
                    event.available_tickets = F('available_tickets') + booking.quantity
                    event.bookings_count = F('bookings_count') - booking.quantity
                    event.save(update_fields=['available_tickets', 'bookings_count'])

        except Exception as e:
            logger.error(f'M-Pesa callback error: {e}', exc_info=True)

        return JsonResponse({'ResultCode': 0, 'ResultDesc': 'Accepted'})
