from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, viewsets, status
from .serializers import UserSerializer, WeatherDataSerializer, YelpEventSerializer, TripSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import WeatherData, YelpEvent, Trip
import requests
import logging
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
import os
from django.db import models
from rest_framework.decorators import action

logger = logging.getLogger(__name__)

# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class WeatherDataView(viewsets.ModelViewSet):
    queryset = WeatherData.objects.all()
    serializer_class = WeatherDataSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        location = self.request.data.get('location')
        if not location:
            raise Exception("Location is required")

        api_key = os.getenv('OPENWEATHER_API_KEY')
        if not api_key:
            raise Exception("OpenWeather API key not found")

        try:
            response = requests.get(
                f'http://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric'
            )
            if response.status_code == 200:
                data = response.json()
                weather_data = {
                    'location': location,
                    'temperature': data['main']['temp'],
                    'description': data['weather'][0]['description'],
                    'rain_chance': data.get('rain', {}).get('1h', 0),
                    'weather_conditions': {
                        'humidity': data['main']['humidity'],
                        'wind_speed': data['wind']['speed']
                    }
                }
                serializer.save(**weather_data)
            else:
                raise Exception(f"Failed to fetch weather data: {response.status_code}")
        except Exception as e:
            logger.error(f"Error fetching weather data: {str(e)}")
            raise

class YelpEventView(viewsets.ModelViewSet):
    queryset = YelpEvent.objects.all()
    serializer_class = YelpEventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        location = self.request.query_params.get('location', None)
        if location:
            return YelpEvent.objects.filter(location__icontains=location)
        return YelpEvent.objects.all()

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Trip.objects.filter(
            models.Q(creator=user) | models.Q(invited_users=user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['post'])
    def add_activity(self, request, pk=None):
        trip = self.get_object()
        activity_id = request.data.get('activity_id')
        if not activity_id:
            return Response(
                {"error": "activity_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            activity = YelpEvent.objects.get(id=activity_id)
            trip.activities.add(activity)
            return Response({"status": "activity added"})
        except YelpEvent.DoesNotExist:
            return Response(
                {"error": "Activity not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def invite_user(self, request, pk=None):
        trip = self.get_object()
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {"error": "user_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
            trip.invited_users.add(user)
            return Response({"status": "user invited"})
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
