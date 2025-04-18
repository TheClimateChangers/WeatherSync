from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, viewsets, status
from .serializers import UserSerializer, WeatherDataSerializer, YelpEventSerializer, TripSerializer, UserProfileSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import WeatherData, YelpEvent, Trip, UserProfile
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
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Trip.objects.all()

    def perform_create(self, serializer):
        serializer.save()

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

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.action == 'list':
            try:
                # Get the current user's profile
                profile = self.request.user.profile
                logger.info(f"Found profile for user {self.request.user.username}")
                return UserProfile.objects.filter(id=profile.id)
            except UserProfile.DoesNotExist:
                logger.warning(f"No profile found for user {self.request.user.username}")
                return UserProfile.objects.none()
        return UserProfile.objects.all()

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            if not queryset.exists():
                logger.warning("No profile found in queryset")
                return Response(
                    {"error": "Profile not found. Please create a profile."},
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in list action: {str(e)}")
            return Response(
                {"error": "An error occurred while fetching the profile"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        if str(kwargs.get('pk')) != str(request.user.id):
            return Response(
                {"error": "You can only access your own profile"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().retrieve(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def follow(self, request, pk=None):
        profile = self.get_object()
        current_user_profile = request.user.profile
        
        if request.user in profile.followers.all():
            # Unfollow
            profile.followers.remove(request.user)
            current_user_profile.following.remove(profile.user)
            return Response({'status': 'unfollowed'})
        else:
            # Follow
            profile.followers.add(request.user)
            current_user_profile.following.add(profile.user)
            return Response({'status': 'followed'})

    @action(detail=False)
    def following(self, request):
        following_profiles = UserProfile.objects.filter(user__in=request.user.profile.following.all())
        serializer = self.get_serializer(following_profiles, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def followers(self, request):
        followers = request.user.profile.followers.all()
        profiles = UserProfile.objects.filter(user__in=followers)
        serializer = self.get_serializer(profiles, many=True)
        return Response(serializer.data)
