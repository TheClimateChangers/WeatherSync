from django.db import models
from django.contrib.auth.models import User
# Create your models here.
class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return self.title
    
class WeatherData(models.Model):
    location = models.CharField(max_length=200)
    temperature = models.FloatField(null=True)
    rain_chance = models.FloatField(null=True)
    weather_conditions = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.location} - {self.timestamp}"

class YelpEvent(models.Model):
    location = models.CharField(max_length=200)
    name = models.CharField(max_length=200)
    rating = models.FloatField(null=True)
    price = models.CharField(max_length=10, null=True)
    categories = models.JSONField(default=list)
    address = models.JSONField(default=dict)
    phone = models.CharField(max_length=20, null=True)
    url = models.URLField(null=True)
    image_url = models.URLField(null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.location}"