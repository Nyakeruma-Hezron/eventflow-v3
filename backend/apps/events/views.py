from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, F
from django.utils import timezone
from .models import Event, Category, TicketType, Venue
from .serializers import (
    EventListSerializer, EventDetailSerializer, EventCreateUpdateSerializer,
    CategorySerializer, TicketTypeSerializer, VenueSerializer
)
from .filters import EventFilter


class IsOrganizerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.is_organizer


class IsEventOrganizer(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.organizer == request.user or request.user.role == 'admin'


class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    queryset = Category.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated]


class VenueListView(generics.ListAPIView):
    serializer_class = VenueSerializer
    queryset = Venue.objects.all()
    permission_classes = [permissions.IsAuthenticated]


class EventListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsOrganizerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = EventFilter
    search_fields = ['title', 'description', 'tags', 'organizer__organization_name']
    ordering_fields = ['start_date', 'base_price', 'bookings_count', 'created_at']
    ordering = ['start_date']
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        qs = Event.objects.select_related('organizer', 'category', 'venue')
        # Organizers can see their own drafts; others only see published
        if self.request.user.is_organizer:
            return qs.filter(
                Q(status='published') | Q(organizer=self.request.user)
            )
        return qs.filter(status='published', start_date__gte=timezone.now())

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventCreateUpdateSerializer
        return EventListSerializer

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event = serializer.save(organizer=request.user)
        return Response(EventDetailSerializer(event, context={'request': request}).data, status=status.HTTP_201_CREATED)


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.select_related('organizer', 'category', 'venue').prefetch_related('ticket_types')
    lookup_field = 'slug'
    permission_classes = [permissions.IsAuthenticated, IsEventOrganizer]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return EventCreateUpdateSerializer
        return EventDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        event = self.get_object()
        Event.objects.filter(pk=event.pk).update(views_count=F('views_count') + 1)
        serializer = self.get_serializer(event)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        event = self.get_object()
        event.status = Event.Status.CANCELLED
        event.save()
        return Response({'detail': 'Event cancelled.'}, status=status.HTTP_200_OK)


class OrganizerEventsView(generics.ListAPIView):
    serializer_class = EventListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(organizer=self.request.user).select_related('category', 'venue').order_by('-created_at')


class TicketTypeCreateView(generics.CreateAPIView):
    serializer_class = TicketTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        event = Event.objects.get(slug=self.kwargs['slug'], organizer=self.request.user)
        serializer.save(event=event)


class FeaturedEventsView(generics.ListAPIView):
    serializer_class = EventListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(
            status='published', featured=True, start_date__gte=timezone.now()
        ).select_related('organizer', 'category').order_by('start_date')[:6]
