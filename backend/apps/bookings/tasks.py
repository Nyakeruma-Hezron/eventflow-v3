from celery import shared_task
from django.core.files.base import ContentFile
from django.utils import timezone
import qrcode
import io
from .models import Booking

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def generate_booking_qr_task(self, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id)
        qr_string = f"EVENTFLOW|{booking.reference}|{booking.event.slug}|{booking.quantity}"
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(qr_string)
        qr.make(fit=True)
        img = qr.make_image(fill_color='black', back_color='white')
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        booking.qr_code.save(f'qr_{booking.reference}.png', ContentFile(buffer.read()), save=True)
    except Booking.DoesNotExist as exc:
        raise self.retry(exc=exc)
    except Exception as exc:
        raise self.retry(exc=exc)
