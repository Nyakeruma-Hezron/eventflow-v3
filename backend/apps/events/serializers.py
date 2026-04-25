from rest_framework import serializers
from .models import Event, Category, TicketType, Venue


class CategorySerializer(serializers.ModelSerializer):
    event_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'color', 'event_count']

    def get_event_count(self, obj):
        return obj.events.filter(status='published').count()


class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = ['id', 'name', 'address', 'city', 'country', 'latitude', 'longitude', 'capacity']


class TicketTypeSerializer(serializers.ModelSerializer):
    quantity_available = serializers.ReadOnlyField()

    class Meta:
        model = TicketType
        fields = ['id', 'name', 'description', 'price', 'quantity', 'quantity_sold', 'quantity_available', 'max_per_order', 'is_active']


class EventListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source='category', write_only=True, required=False, allow_null=True)
    organizer_name = serializers.SerializerMethodField()
    organizer_id = serializers.SerializerMethodField()
    is_available = serializers.ReadOnlyField()
    occupancy_percentage = serializers.ReadOnlyField()
    poster_url = serializers.SerializerMethodField()
    banner_url = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'slug', 'short_description', 'poster_url', 'banner_url',
            'start_date', 'end_date', 'base_price', 'is_free', 'status', 'format',
            'category', 'category_id', 'organizer_name', 'organizer_id',
            'available_tickets', 'total_capacity', 'occupancy_percentage',
            'is_available', 'featured', 'views_count', 'bookings_count', 'tags',
        ]

    def get_organizer_name(self, obj):
        return obj.organizer.display_name

    def get_organizer_id(self, obj):
        return str(obj.organizer.id)

    def get_poster_url(self, obj):
        if obj.poster:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.poster.url)
        return None

    def get_banner_url(self, obj):
        if obj.banner:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.banner.url)
        return None


class EventDetailSerializer(EventListSerializer):
    ticket_types = TicketTypeSerializer(many=True, read_only=True)
    venue = VenueSerializer(read_only=True)
    venue_id = serializers.PrimaryKeyRelatedField(queryset=Venue.objects.all(), source='venue', write_only=True, required=False, allow_null=True)
    tags_list = serializers.SerializerMethodField()

    class Meta(EventListSerializer.Meta):
        fields = EventListSerializer.Meta.fields + [
            'description', 'venue', 'venue_id', 'ticket_types', 'tags_list',
            'registration_deadline', 'online_link', 'min_tickets_per_booking',
            'max_tickets_per_booking', 'created_at', 'updated_at',
        ]

    def get_tags_list(self, obj):
        return obj.get_tag_list()


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'title', 'short_description', 'description', 'category', 'venue',
            'format', 'online_link', 'poster', 'banner',
            'start_date', 'end_date', 'registration_deadline',
            'total_capacity', 'base_price', 'is_free',
            'min_tickets_per_booking', 'max_tickets_per_booking',
            'tags', 'status',
        ]

    def validate(self, data):
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] >= data['end_date']:
                raise serializers.ValidationError({'end_date': 'End date must be after start date.'})
        return data
