from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
from .serializers import UserSerializer, UpdateProfileSerializer

User = get_user_model()


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get and update current user profile."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = UpdateProfileSerializer(
            request.user, data=request.data, partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user, context={'request': request}).data)


class BecomeOrganizerView(APIView):
    """Upgrade user role to organizer."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.is_organizer:
            return Response({'detail': 'Already an organizer.'}, status=status.HTTP_400_BAD_REQUEST)

        org_name = request.data.get('organization_name', '').strip()
        if not org_name:
            return Response({'detail': 'Organization name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        user.role = User.Role.ORGANIZER
        user.organization_name = org_name
        user.bio = request.data.get('bio', user.bio)
        user.phone = request.data.get('phone', user.phone)
        user.save()
        return Response(UserSerializer(user, context={'request': request}).data)


class GoogleAuthView(APIView):
    """
    Google OAuth2 token verification.
    Receives the ID token from frontend (after Google Sign-In),
    verifies it, creates/gets user, returns JWT tokens.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        credential = request.data.get('credential')  # Google ID token
        if not credential:
            return Response({'detail': 'Google credential required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            idinfo = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except ValueError as e:
            return Response({'detail': f'Invalid Google token: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        email = idinfo.get('email')
        if not email:
            return Response({'detail': 'Email not found in Google token.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': idinfo.get('given_name', ''),
                'last_name': idinfo.get('family_name', ''),
                'is_active': True,
            }
        )

        # Issue JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user, context={'request': request}).data,
            'created': created,
        })
