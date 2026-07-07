from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Event, Category, Venue
from .cache_utils import (
    invalidate_featured_events_cache,
    invalidate_categories_cache,
    invalidate_venues_cache,
    invalidate_event_detail_cache,
)


@receiver(post_save, sender=Event)
def refresh_event_cache(sender, instance, **kwargs):
    invalidate_event_detail_cache(instance.slug)
    if instance.status == Event.Status.PUBLISHED and instance.featured:
        invalidate_featured_events_cache()


@receiver(post_delete, sender=Event)
def delete_event_cache(sender, instance, **kwargs):
    invalidate_event_detail_cache(instance.slug)
    invalidate_featured_events_cache()


@receiver(post_save, sender=Category)
def refresh_category_cache(sender, instance, **kwargs):
    invalidate_categories_cache()


@receiver(post_save, sender=Venue)
def refresh_venue_cache(sender, instance, **kwargs):
    invalidate_venues_cache()
