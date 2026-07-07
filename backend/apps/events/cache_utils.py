from django.core.cache import cache

FEATURED_EVENTS_KEY = 'eventflow:featured_events'
CATEGORIES_KEY = 'eventflow:active_categories'
VENUES_KEY = 'eventflow:venues'
EVENT_DETAIL_KEY = 'eventflow:event_detail:{}'


def invalidate_featured_events_cache():
    cache.delete(FEATURED_EVENTS_KEY)


def invalidate_categories_cache():
    cache.delete(CATEGORIES_KEY)


def invalidate_venues_cache():
    cache.delete(VENUES_KEY)


def invalidate_event_detail_cache(slug):
    cache.delete(EVENT_DETAIL_KEY.format(slug))


def get_event_detail_cache_key(slug):
    return EVENT_DETAIL_KEY.format(slug)
