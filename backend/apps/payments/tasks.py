from celery import shared_task
from django.utils import timezone
from .models import Payment
from apps.bookings.models import Booking
from apps.bookings.tasks import generate_booking_qr_task

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def finalize_payment_task(self, payment_id, callback_payload=None):
    try:
        payment = Payment.objects.select_related('booking__event').get(id=payment_id)
        if payment.status == Payment.Status.COMPLETED:
            return

        booking = payment.booking
        booking.status = Booking.Status.CONFIRMED
        booking.confirmed_at = timezone.now()
        booking.save(update_fields=['status', 'confirmed_at'])
        generate_booking_qr_task.delay(str(booking.id))
    except Payment.DoesNotExist as exc:
        raise self.retry(exc=exc)
    except Exception as exc:
        raise self.retry(exc=exc)
