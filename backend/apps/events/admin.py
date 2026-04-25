from django.contrib import admin
from .models import Category, Venue, Event, TicketType

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'country', 'capacity']

class TicketTypeInline(admin.TabularInline):
    model = TicketType
    extra = 1

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'organizer', 'status', 'start_date', 'available_tickets', 'base_price']
    list_filter = ['status', 'category', 'featured']
    search_fields = ['title', 'organizer__email']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [TicketTypeInline]
