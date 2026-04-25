from django.urls import path
from . import views

urlpatterns = [
    path('', views.BookingListView.as_view(), name='booking_list'),
    path('create/', views.CreateBookingView.as_view(), name='create_booking'),
    path('<str:reference>/', views.BookingDetailView.as_view(), name='booking_detail'),
    path('<str:reference>/cancel/', views.CancelBookingView.as_view(), name='cancel_booking'),
]
