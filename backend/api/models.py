# models.py
from django.db import models
from django.contrib.postgres.fields import JSONField


class Event(models.Model):
    eventbrite_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    eco_score = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class WeatherData(models.Model):
    location = models.CharField(max_length=200)
    temperature = models.FloatField(null=True)
    rain_chance = models.FloatField(null=True)
    weather_conditions = JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.location} - {self.timestamp}"
