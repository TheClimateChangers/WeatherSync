from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

class WeatherData(models.Model):
    location = models.CharField(max_length=255)
    temperature = models.FloatField()
    description = models.CharField(max_length=255, default="No description available")
    timestamp = models.DateTimeField(auto_now_add=True)
    rain_chance = models.FloatField(default=0.0)
    weather_conditions = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.location} - {self.temperature}°C - {self.description}"

class YelpEvent(models.Model):
    location = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    rating = models.FloatField()
    price = models.CharField(max_length=10, blank=True, null=True)
    categories = models.JSONField()
    address = models.TextField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Trip(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_trips')
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    activities = models.ManyToManyField(YelpEvent, related_name='trips')
    invited_users = models.ManyToManyField(User, related_name='invited_trips')
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Trip by {self.creator.username} ({self.start_date} to {self.end_date})"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.end_date < self.start_date:
            raise ValidationError("End date cannot be before start date")
        if self.start_date < timezone.now().date():
            raise ValidationError("Start date cannot be in the past")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
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
        return self.user.trips_created.count()

    def __str__(self):
        return f"{self.user.username}'s Profile"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()