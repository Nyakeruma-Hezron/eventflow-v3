from django.urls import path
from .views import GoogleAuthView

urlpatterns = [
    path('', GoogleAuthView.as_view(), name='google_auth'),
]
