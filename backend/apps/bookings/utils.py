import qrcode
import io
from django.core.files.base import ContentFile
from django.utils import timezone
import logging

logger = logging.getLogger('apps.bookings')


def generate_booking_qr(booking):
    qr_string = f"EVENTFLOW|{booking.reference}|{booking.event.slug}|{booking.quantity}"
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(qr_string)
    qr.make(fit=True)
    img = qr.make_image(fill_color='black', back_color='white')
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    booking.qr_code.save(f'qr_{booking.reference}.png', ContentFile(buffer.read()), save=True)
