from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
from .trip_manager import TripManager

class Weather(models.Model):
    """
    Weather data for a specific location and date.
    This is used for the weather forecast for each day of a trip.
    """
    location = models.CharField(max_length=255)
    date = models.DateField()
    temperature = models.FloatField()
    description = models.CharField(max_length=255, default="No description available")
    timestamp = models.DateTimeField(auto_now_add=True)
    rain_chance = models.FloatField(default=0.0)
    weather_conditions = models.JSONField(default=dict)
    
    class Meta:
        unique_together = ('location', 'date')
        
    def __str__(self):
        return f"Weather for {self.location} on {self.date}: {self.temperature}°F, {self.description}"

class Activity(models.Model):
    """
    Activities that can be part of a trip day itinerary.
    This can be sourced from Yelp or Ticketmaster APIs.
    """
    location = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    rating = models.FloatField(null=True, blank=True)
    price = models.CharField(max_length=10, blank=True, null=True)
    categories = models.JSONField(default=list)
    address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    url = models.TextField(blank=True, null=True)
    image_url = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    # Additional fields for activity scheduling
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    # Source of the activity data
    source = models.CharField(max_length=20, choices=[
        ('YELP', 'Yelp API'),
        ('TICKETMASTER', 'Ticketmaster API'),
        ('MANUAL', 'Manually Added')
    ], default='MANUAL')
    # External ID from the source API
    external_id = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return f"{self.name} in {self.location}"
    
    class Meta:
        verbose_name_plural = "Activities"

class DayActivity(models.Model):
    """
    Represents a scheduled activity on a specific trip day.
    This links an Activity to a TripDay with scheduling information.
    """
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='day_activities')
    time_slot = models.CharField(max_length=20, choices=[
        ('morning', 'Morning'),
        ('lunch', 'Lunch'),
        ('afternoon', 'Afternoon'),
        ('dinner', 'Dinner'),
        ('evening', 'Evening'),
        ('night', 'Night')
    ])
    order = models.PositiveSmallIntegerField(default=0)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['time_slot', 'order']
        verbose_name_plural = "Day Activities"
    
    def __str__(self):
        return f"{self.activity.name} - {self.get_time_slot_display()}"

class TripDay(models.Model):
    """
    Represents a single day in a trip itinerary.
    Contains the date, weather, and activities for that day.
    """
    date = models.DateField()
    weather = models.ForeignKey(Weather, on_delete=models.SET_NULL, null=True, blank=True, related_name='trip_days')
    activities = models.ManyToManyField(DayActivity, related_name='trip_day')
    
    class Meta:
        ordering = ['date']
        verbose_name_plural = "Trip Days"
    
    def __str__(self):
        return f"Trip Day on {self.date}"

class Trip(models.Model):
    """
    Main trip model that contains all information about a trip.
    """
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_trips')
    location = models.CharField(max_length=255, default="Unknown", help_text="City or destination name for the trip")
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    activities = models.ManyToManyField(Activity, related_name='trips', blank=True)
    invited_users = models.ManyToManyField(User, related_name='invited_trips', blank=True)
    is_active = models.BooleanField(default=True)
    days = models.ManyToManyField(TripDay, related_name='trip', blank=True)
    
    # Legacy field to store the itinerary in JSON format
    # This will be used for backward compatibility
    itinerary = models.JSONField(blank=True, null=True, help_text="Generated itinerary schedule (legacy)")

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Trip to {self.location} by {self.creator.username} ({self.start_date} to {self.end_date})"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.end_date < self.start_date:
            raise ValidationError("End date cannot be before start date")
        if self.start_date < timezone.now().date():
            raise ValidationError("Start date cannot be in the past")

    def save(self, *args, **kwargs):
        # Skip validation for existing instances to prevent issues with past trips
        if not self.pk:
            self.full_clean()
        super().save(*args, **kwargs)
        
    def generate_itinerary(self):
        return TripManager.generate_itinerary(self)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    nickname = models.CharField(max_length=50, blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True, null=True)
    followers = models.ManyToManyField(User, related_name='following_profiles', blank=True)
    following = models.ManyToManyField(User, related_name='followed_by', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def followers_count(self):
        return self.followers.count()

    @property
    def following_count(self):
        return self.following.count()

    @property
    def trips_count(self):
        return self.user.created_trips.count()

    def __str__(self):
        return f"{self.user.username}'s Profile"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()