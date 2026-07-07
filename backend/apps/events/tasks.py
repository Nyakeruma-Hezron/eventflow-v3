from celery import shared_task
from django.db.models import F
from django.utils import timezone
from django.core.cache import cache
from .models import Event
from .counters import get_event_views_key

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def flush_event_view_counts(self):
    client = cache.client.get_client()
    keys = client.keys(get_event_views_key('*'))
    for key in keys:
        try:
            slug = key.decode().split(':')[-1]
            value = int(client.get(key) or 0)
            if value > 0:
                Event.objects.filter(slug=slug).update(views_count=F('views_count') + value)
                client.delete(key)
        except Exception as exc:
            raise self.retry(exc=exc)
