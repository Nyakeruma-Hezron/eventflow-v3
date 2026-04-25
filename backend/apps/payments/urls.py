from django.urls import path
from . import views

urlpatterns = [
    path('initiate/', views.InitiatePaymentView.as_view(), name='initiate_payment'),
    path('status/<uuid:payment_id>/', views.PaymentStatusView.as_view(), name='payment_status'),
    path('mpesa/callback/', views.MpesaCallbackView.as_view(), name='mpesa_callback'),
]
