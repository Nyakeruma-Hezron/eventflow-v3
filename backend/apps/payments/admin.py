from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'amount', 'method', 'status', 'mpesa_receipt_number', 'paid_at']
    list_filter = ['status', 'method']
    readonly_fields = ['id', 'created_at']
