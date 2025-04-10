from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import UserSerializer, NoteSerializer, WeatherDataSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, WeatherData
import requests
import os
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

# Create your views here.
class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class WeatherDataView(generics.ListCreateAPIView):
    serializer_class = WeatherDataSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        location = self.request.query_params.get('location', None)
        if location:
            return WeatherData.objects.filter(location=location).order_by('-timestamp')[:1]
        return WeatherData.objects.none()

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            if not queryset.exists():
                # If no data exists, fetch new data
                location = request.query_params.get('location')
                if location:
                    return self.fetch_and_save_weather(location)
            serializer = self.get_serializer(queryset.first())
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in list view: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request, *args, **kwargs):
        try:
            location = request.data.get('location')
            if not location:
                return Response(
                    {"error": "Location is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            return self.fetch_and_save_weather(location)
        except Exception as e:
            logger.error(f"Error in create view: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def fetch_and_save_weather(self, location):
        try:
            # Get weather data from OpenWeatherMap API
            api_key = os.getenv('OPENWEATHER_API_KEY')
            if not api_key:
                logger.error("OpenWeather API key not found in environment variables")
                return Response(
                    {"error": "Weather service configuration error"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
            logger.info(f"Fetching weather data for {location}")
            response = requests.get(url)
            
            if response.status_code == 200:
                data = response.json()
                weather_data = {
                    'location': location,
                    'temperature': data['main']['temp'],
                    'rain_chance': data.get('rain', {}).get('1h', 0) if 'rain' in data else 0,
                    'weather_conditions': {
                        'main': data['weather'][0]['main'],
                        'description': data['weather'][0]['description'],
                        'icon': data['weather'][0]['icon']
                    }
                }
                serializer = self.get_serializer(data=weather_data)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                else:
                    logger.error(f"Serializer errors: {serializer.errors}")
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                logger.error(f"OpenWeather API error: {response.status_code} - {response.text}")
                return Response(
                    {"error": "Failed to fetch weather data"}, 
                    status=status.HTTP_502_BAD_GATEWAY
                )
        except Exception as e:
            logger.error(f"Error fetching weather: {str(e)}")
            return Response(
                {"error": "Failed to fetch weather data"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
