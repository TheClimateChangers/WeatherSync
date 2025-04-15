from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, viewsets, status
from .serializers import UserSerializer, WeatherDataSerializer, YelpEventSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import WeatherData, YelpEvent
import requests
import logging
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response

logger = logging.getLogger(__name__)

# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class WeatherDataView(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request):
        location = request.query_params.get('location')
        if not location:
            return Response({"error": "Location parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        api_key = settings.OPENWEATHER_API_KEY
        if not api_key:
            logger.error("OpenWeather API key not found in settings")
            return Response({"error": "Weather service configuration error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            response = requests.get(
                f"https://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
            )
            if response.status_code == 200:
                data = response.json()
                weather_data = {
                    "location": location,
                    "temperature": data["main"]["temp"],
                    "rain_chance": data.get("rain", {}).get("1h", 0),
                    "weather_conditions": {
                        "main": data["weather"][0]["main"],
                        "description": data["weather"][0]["description"],
                        "icon": data["weather"][0]["icon"]
                    }
                }
                serializer = WeatherDataSerializer(data=weather_data)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                logger.error(f"OpenWeather API error: {response.status_code} - {response.text}")
                return Response({"error": "Failed to fetch weather data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Error fetching weather data: {str(e)}")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class YelpEventView(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request):
        location = request.query_params.get('location')
        if not location:
            return Response({"error": "Location parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        api_key = settings.YELP_API_KEY
        if not api_key:
            logger.error("Yelp API key not found in settings")
            return Response({"error": "Yelp service configuration error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            response = requests.get(
                f"https://api.yelp.com/v3/businesses/search?location={location}&limit=10",
                headers=headers
            )
            if response.status_code == 200:
                data = response.json()
                events = []
                for business in data.get("businesses", []):
                    event_data = {
                        "location": location,
                        "name": business["name"],
                        "rating": business["rating"],
                        "price": business.get("price", ""),
                        "categories": [cat["title"] for cat in business["categories"]],
                        "address": ", ".join(business["location"]["display_address"]),
                        "phone": business.get("phone", ""),
                        "url": business.get("url", ""),
                        "image_url": business.get("image_url", "")
                    }
                    serializer = YelpEventSerializer(data=event_data)
                    if serializer.is_valid():
                        serializer.save()
                        events.append(serializer.data)
                return Response(events)
            else:
                logger.error(f"Yelp API error: {response.status_code} - {response.text}")
                return Response({"error": "Failed to fetch Yelp events"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Error fetching Yelp events: {str(e)}")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
