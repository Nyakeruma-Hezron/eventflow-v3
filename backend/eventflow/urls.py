from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from .health import health

admin.site.site_header = "EventFlow Admin"
admin.site.site_title = "EventFlow"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health, name='health'),

    # JWT Auth
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # dj-rest-auth (login, logout, register, password)
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),

    # Google OAuth
    path('api/auth/social/', include('allauth.socialaccount.urls')),
    path('api/auth/google/', include('apps.users.google_urls')),

    # App APIs
    path('api/users/', include('apps.users.urls')),
    path('api/events/', include('apps.events.urls')),
    path('api/bookings/', include('apps.bookings.urls')),
    path('api/payments/', include('apps.payments.urls')),

    # Prometheus Metrics Endpoint
    path('', include('django_prometheus.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
