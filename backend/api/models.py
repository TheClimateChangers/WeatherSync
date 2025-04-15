from django.db import models
from django.contrib.auth.models import User

class WeatherData(models.Model):
    location = models.CharField(max_length=100)
    temperature = models.FloatField(default=0.0)
    rain_chance = models.FloatField(default=0)
    weather_conditions = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Weather in {self.location} at {self.timestamp}"

class YelpEvent(models.Model):
    location = models.CharField(max_length=100)
    name = models.CharField(max_length=200)
    rating = models.FloatField()
    price = models.CharField(max_length=10, blank=True)
    categories = models.JSONField()
    address = models.TextField()
    phone = models.CharField(max_length=20, blank=True)
    url = models.URLField(blank=True)
    image_url = models.URLField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} in {self.location}"