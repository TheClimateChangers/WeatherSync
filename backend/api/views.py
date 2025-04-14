from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, NoteSerializer, WeatherDataSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, WeatherData
from .services import WeatherService
import requests
import os
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging

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

class WeatherDataView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        location = request.query_params.get('location')
        if not location:
            return Response(
                {"error": "Location parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Try to get cached data first
            cached_data = WeatherData.objects.filter(location=location).first()
            if cached_data:
                return Response({
                    "location": cached_data.location,
                    "temperature": cached_data.temperature,
                    "rain_chance": cached_data.rain_chance,
                    "weather_conditions": cached_data.weather_conditions
                })
            
            # If no cached data, fetch new data
            weather_data = WeatherService.fetch_weather(location)
            if not weather_data:
                return Response(
                    {"error": "Failed to fetch weather data"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Save the new data
            WeatherService.save_weather_data(weather_data)
            
            return Response(weather_data)
            
        except Exception as e:
            logger.error(f"Error in WeatherDataView: {str(e)}")
            return Response(
                {"error": "An error occurred while processing your request"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class WeatherForecastView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        location = request.query_params.get('location')
        days = int(request.query_params.get('days', 5))  # Default to 5 days
        
        if not location:
            return Response(
                {"error": "Location parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            forecast_data = WeatherService.fetch_forecast(location, days)
            if not forecast_data:
                return Response(
                    {"error": "Failed to fetch forecast data"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            return Response(forecast_data)
            
        except Exception as e:
            logger.error(f"Error in WeatherForecastView: {str(e)}")
            return Response(
                {"error": "An error occurred while processing your request"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class YelpActivitiesView(APIView):
    permission_classes = [AllowAny]  # You can switch to IsAuthenticated if needed

    def get(self, request):
        location = request.query_params.get('location', 'San Diego')
        term = request.query_params.get('term', 'activities')  # could be "fun", "events", etc.
        limit = request.query_params.get('limit', 10)

        headers = {
            "Authorization": f"Bearer {settings.YELP_API_KEY}"
        }

        url = "https://api.yelp.com/v3/businesses/search"
        params = {
            "location": location,
            "term": term,
            "limit": limit,
            "sort_by": "best_match",
            "categories": "active,arts,nightlife"  # Example: filter to fun stuff
        }

        try:
            response = requests.get(url, headers=headers, params=params)
            data = response.json()
            return Response(data, status=response.status_code)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
