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

class WeatherDataView(generics.ListCreateAPIView):
    serializer_class = WeatherDataSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        location = self.request.query_params.get('location', None)
        if location:
            return WeatherData.objects.filter(location=location).order_by('-timestamp')[:1]
        return WeatherData.objects.none()

    def get(self, request, *args, **kwargs):
        location = request.query_params.get('location')
        if not location:
            return Response({"error": "Location is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Use WeatherService to fetch and save weather data
            weather_data = WeatherService.fetch_weather(location)
            if not weather_data:
                return Response({"error": "Failed to fetch weather data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Save the weather data
            weather_instance = WeatherService.save_weather_data(weather_data)
            if not weather_instance:
                return Response({"error": "Failed to save weather data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Serialize and return the data
            serializer = self.get_serializer(weather_instance)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error in weather view: {str(e)}")
            return Response({"error": "Failed to process weather request"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_create(self, serializer):
        # This method is kept for POST requests if needed
        serializer.save()

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
