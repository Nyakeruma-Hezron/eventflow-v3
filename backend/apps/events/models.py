from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone
from django.core.validators import MinValueValidator
import uuid


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    icon = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=7, default='#6366f1')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        ordering = ['name']
        verbose_name_plural = 'categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Venue(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='Kenya')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    capacity = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'venues'

    def __str__(self):
        return f'{self.name}, {self.city}'


class Event(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        CANCELLED = 'cancelled', 'Cancelled'
        COMPLETED = 'completed', 'Completed'

    class Format(models.TextChoices):
        IN_PERSON = 'in_person', 'In Person'
        ONLINE = 'online', 'Online'
        HYBRID = 'hybrid', 'Hybrid'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='organized_events')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='events')
    venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')

    title = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True)
    poster = models.ImageField(upload_to='events/posters/', null=True, blank=True)
    banner = models.ImageField(upload_to='events/banners/', null=True, blank=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT, db_index=True)
    format = models.CharField(max_length=20, choices=Format.choices, default=Format.IN_PERSON)
    online_link = models.URLField(blank=True)

    start_date = models.DateTimeField(db_index=True)
    end_date = models.DateTimeField()
    registration_deadline = models.DateTimeField(null=True, blank=True)

    total_capacity = models.PositiveIntegerField(default=0)
    available_tickets = models.PositiveIntegerField(default=0)
    min_tickets_per_booking = models.PositiveSmallIntegerField(default=1)
    max_tickets_per_booking = models.PositiveSmallIntegerField(default=10)

    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, validators=[MinValueValidator(0)])
    is_free = models.BooleanField(default=False)

    tags = models.CharField(max_length=500, blank=True)
    featured = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    bookings_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'events'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'start_date']),
            models.Index(fields=['organizer', 'status']),
            models.Index(fields=['featured', 'status']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['venue', 'status']),
            models.Index(fields=['registration_deadline']),
            models.Index(fields=['start_date', 'featured']),
        ]
        constraints = [
            models.CheckConstraint(check=models.Q(available_tickets__gte=0), name='event_available_tickets_non_negative'),
            models.CheckConstraint(check=models.Q(total_capacity__gte=0), name='event_total_capacity_non_negative'),
            models.CheckConstraint(check=models.Q(bookings_count__gte=0), name='event_bookings_count_non_negative'),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)
            slug, n = base, 1
            while Event.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{n}'
                n += 1
            self.slug = slug
        if not self.available_tickets and self.total_capacity:
            self.available_tickets = self.total_capacity
        if self.base_price == 0:
            self.is_free = True
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    @property
    def is_available(self):
        return (self.status == self.Status.PUBLISHED and
                self.available_tickets > 0 and
                self.start_date > timezone.now())

    @property
    def occupancy_percentage(self):
        if not self.total_capacity:
            return 0
        return round(((self.total_capacity - self.available_tickets) / self.total_capacity) * 100, 1)

    def get_tag_list(self):
        return [t.strip() for t in self.tags.split(',') if t.strip()]


class TicketType(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='ticket_types')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    quantity = models.PositiveIntegerField()
    quantity_sold = models.PositiveIntegerField(default=0)
    max_per_order = models.PositiveSmallIntegerField(default=10)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'ticket_types'
        indexes = [
            models.Index(fields=['event', 'is_active']),
        ]
        constraints = [
            models.CheckConstraint(check=models.Q(quantity__gte=0), name='ticket_quantity_non_negative'),
            models.CheckConstraint(check=models.Q(quantity_sold__gte=0), name='ticket_quantity_sold_non_negative'),
            models.CheckConstraint(check=models.Q(quantity__gte=models.F('quantity_sold')), name='ticket_quantity_sold_lte_quantity'),
        ]

    @property
    def quantity_available(self):
        return self.quantity - self.quantity_sold

    def __str__(self):
        return f'{self.event.title} – {self.name}'
