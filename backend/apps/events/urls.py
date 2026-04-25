from django.urls import path
from . import views

urlpatterns = [
    path('', views.EventListCreateView.as_view(), name='event_list'),
    path('featured/', views.FeaturedEventsView.as_view(), name='featured_events'),
    path('my-events/', views.OrganizerEventsView.as_view(), name='my_events'),
    path('categories/', views.CategoryListView.as_view(), name='category_list'),
    path('venues/', views.VenueListView.as_view(), name='venue_list'),
    path('<slug:slug>/', views.EventDetailView.as_view(), name='event_detail'),
    path('<slug:slug>/tickets/', views.TicketTypeCreateView.as_view(), name='ticket_create'),
]
