from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'currency', 'method', 'status', 'mpesa_receipt_number', 'paid_at', 'created_at']
        read_only_fields = fields


class InitiatePaymentSerializer(serializers.Serializer):
    booking_reference = serializers.CharField()
    phone = serializers.CharField()
