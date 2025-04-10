from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, NoteSerializer, WeatherDataSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, WeatherData
import requests
import os
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

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

    def perform_create(self, serializer):
        location = self.request.data.get('location')
        if not location:
            return

        # Get weather data from OpenWeatherMap API
        api_key = os.getenv('OPENWEATHERMAP_API_KEY')
        if not api_key:
            raise Exception("OpenWeatherMap API key not found")

        url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
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
            serializer.save(**weather_data)
        else:
            raise Exception(f"Failed to fetch weather data: {response.status_code}")

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
