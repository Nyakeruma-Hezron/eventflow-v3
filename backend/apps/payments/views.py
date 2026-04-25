import json, logging
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils import timezone
from django.utils.decorators import method_decorator
from .models import Payment
from .serializers import PaymentSerializer, InitiatePaymentSerializer
from .utils import initiate_stk_push
from apps.bookings.models import Booking
from apps.bookings.utils import generate_booking_qr

logger = logging.getLogger('apps.payments')


class InitiatePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            booking = Booking.objects.get(reference=data['booking_reference'], user=request.user, status='pending')
        except Booking.DoesNotExist:
            return Response({'detail': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

        payment, _ = Payment.objects.get_or_create(
            booking=booking,
            defaults={'user': request.user, 'amount': booking.grand_total, 'method': 'mpesa', 'status': 'pending'}
        )

        try:
            resp = initiate_stk_push(
                phone=data['phone'],
                amount=float(booking.grand_total),
                reference=booking.reference,
                description=f'EventFlow {booking.reference}',
            )
            payment.mpesa_phone = data['phone']
            payment.mpesa_checkout_id = resp.get('CheckoutRequestID', '')
            payment.status = 'processing'
            payment.gateway_response = resp
            payment.save()
            return Response({'payment_id': str(payment.id), 'checkout_request_id': resp.get('CheckoutRequestID'), 'message': 'STK Push sent. Enter your M-Pesa PIN.'})
        except Exception as e:
            logger.error(f'STK Push error: {e}')
            return Response({'detail': 'Payment initiation failed. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)


class PaymentStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id, user=request.user)
        except Payment.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({
            'status': payment.status,
            'booking_reference': payment.booking.reference,
        })


@method_decorator(csrf_exempt, name='dispatch')
class MpesaCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            body = json.loads(request.body)
            stk = body.get('Body', {}).get('stkCallback', {})
            checkout_id = stk.get('CheckoutRequestID')
            result_code = str(stk.get('ResultCode', ''))
            result_desc = stk.get('ResultDesc', '')

            payment = Payment.objects.filter(mpesa_checkout_id=checkout_id).first()
            if not payment:
                return JsonResponse({'ResultCode': 0, 'ResultDesc': 'Accepted'})

            if result_code == '0':
                items = {i['Name']: i.get('Value') for i in stk.get('CallbackMetadata', {}).get('Item', [])}
                payment.status = 'completed'
                payment.mpesa_receipt_number = items.get('MpesaReceiptNumber', '')
                payment.paid_at = timezone.now()
                payment.gateway_response = body
                payment.save()

                booking = payment.booking
                booking.status = Booking.Status.CONFIRMED
                booking.confirmed_at = timezone.now()
                booking.save(update_fields=['status', 'confirmed_at'])
                generate_booking_qr(booking)
            else:
                payment.status = 'failed'
                payment.failure_reason = result_desc
                payment.save()
                # Restore availability
                booking = payment.booking
                booking.event.available_tickets += booking.quantity
                booking.event.bookings_count = max(0, booking.event.bookings_count - booking.quantity)
                booking.event.save(update_fields=['available_tickets', 'bookings_count'])

        except Exception as e:
            logger.error(f'M-Pesa callback error: {e}', exc_info=True)

        return JsonResponse({'ResultCode': 0, 'ResultDesc': 'Accepted'})
