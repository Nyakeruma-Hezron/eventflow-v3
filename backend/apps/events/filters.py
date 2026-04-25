import django_filters
from .models import Event


class EventFilter(django_filters.FilterSet):
    category = django_filters.NumberFilter(field_name='category__id')
    is_free = django_filters.BooleanFilter()
    format = django_filters.CharFilter()
    featured = django_filters.BooleanFilter()
    status = django_filters.CharFilter()
    date_from = django_filters.DateTimeFilter(field_name='start_date', lookup_expr='gte')
    date_to = django_filters.DateTimeFilter(field_name='start_date', lookup_expr='lte')
    price_min = django_filters.NumberFilter(field_name='base_price', lookup_expr='gte')
    price_max = django_filters.NumberFilter(field_name='base_price', lookup_expr='lte')

    class Meta:
        model = Event
        fields = ['category', 'is_free', 'format', 'featured', 'status']
