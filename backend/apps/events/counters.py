from django.core.cache import cache
from django.conf import settings

VIEWS_COUNT_KEY = 'eventflow:views_count:{}'


def get_event_views_key(slug):
    return VIEWS_COUNT_KEY.format(slug)


def increment_event_views(slug):
    key = get_event_views_key(slug)
    if not cache.add(key, 0):
        pass
    return cache.incr(key)


def get_pending_event_views(slug):
    return cache.get(get_event_views_key(slug), 0)


def pop_pending_event_views(slug):
    key = get_event_views_key(slug)
    value = cache.get(key, 0)
    cache.delete(key)
    return value


def get_all_pending_event_view_keys():
    client = cache.client.get_client()
    return client.keys(VIEWS_COUNT_KEY.format('*'))
