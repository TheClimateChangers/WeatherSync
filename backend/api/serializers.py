from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note, WeatherData, YelpEvent

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        read_only_fields = ["author"]

class WeatherDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherData
        fields = ["id", "location", "temperature", "rain_chance", "weather_conditions", "timestamp"]

class YelpEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = YelpEvent
        fields = ["id", "location", "name", "rating", "price", "categories", 
                 "address", "phone", "url", "image_url", "timestamp"]