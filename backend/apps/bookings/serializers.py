from rest_framework import serializers
from .models import Booking
from apps.events.serializers import EventListSerializer


class BookingSerializer(serializers.ModelSerializer):
    event_detail = EventListSerializer(source='event', read_only=True)
    grand_total = serializers.ReadOnlyField()

    class Meta:
        model = Booking
        fields = [
            'id', 'reference', 'event', 'event_detail', 'ticket_type',
            'quantity', 'unit_price', 'total_amount', 'service_fee', 'grand_total',
            'status', 'qr_code', 'attendee_name', 'attendee_email', 'attendee_phone',
            'confirmed_at', 'created_at',
        ]
        read_only_fields = ['id', 'reference', 'status', 'confirmed_at', 'created_at', 'qr_code']


class CreateBookingSerializer(serializers.Serializer):
    event_slug = serializers.CharField()
    ticket_type_id = serializers.IntegerField(required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1, max_value=20)
    attendee_phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
