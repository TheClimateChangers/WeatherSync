from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, viewsets, status
from .serializers import UserSerializer, WeatherDataSerializer, YelpEventSerializer, TripSerializer, UserProfileSerializer, WeatherForecastSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import WeatherData, YelpEvent, Trip, UserProfile, WeatherForecast
import requests
import logging
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
import os
from django.db import models
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework import serializers
from rest_framework import permissions

logger = logging.getLogger(__name__)

# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class WeatherDataView(viewsets.ModelViewSet):
    queryset = WeatherData.objects.all()
    serializer_class = WeatherDataSerializer
    permission_classes = [AllowAny]

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

class WeatherForecastView(viewsets.ModelViewSet):
    queryset = WeatherForecast.objects.all()
    serializer_class = WeatherForecastSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        location = self.request.query_params.get('location', None)
        if location:
            # Check if we already have recent data for this location (less than 3 hours old)
            three_hours_ago = timezone.now() - timezone.timedelta(hours=3)
            recent_forecasts = WeatherForecast.objects.filter(
                location__iexact=location,
                timestamp__gte=three_hours_ago
            )
            
            if recent_forecasts.exists():
                return recent_forecasts
            else:
                # No recent data, fetch new data
                try:
                    self.fetch_forecast_data(location)
                    return WeatherForecast.objects.filter(location__iexact=location)
                except Exception as e:
                    logger.error(f"Error fetching forecast data: {str(e)}")
                    return WeatherForecast.objects.none()
        
        return WeatherForecast.objects.all()

    def fetch_forecast_data(self, location):
        """Fetch weather forecast data from OpenWeatherMap API"""
        api_key = os.getenv('OPENWEATHER_API_KEY')
        if not api_key:
            raise Exception("OpenWeather API key not found")

        # Get 5-day forecast data
        response = requests.get(
            f'http://api.openweathermap.org/data/2.5/forecast?q={location}&appid={api_key}&units=metric'
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Clear existing forecasts for this location
            WeatherForecast.objects.filter(location__iexact=location).delete()
            
            # Process and save forecast data
            for forecast in data['list']:
                forecast_date = timezone.datetime.fromtimestamp(forecast['dt'], tz=timezone.utc).date()
                forecast_obj = WeatherForecast.objects.create(
                    location=location,
                    forecast_date=forecast_date,
                    temperature_min=forecast['main']['temp_min'],
                    temperature_max=forecast['main']['temp_max'],
                    description=forecast['weather'][0]['description'],
                    rain_chance=forecast.get('pop', 0) * 100,  # Convert probability to percentage
                    weather_conditions={
                        'humidity': forecast['main']['humidity'],
                        'wind_speed': forecast['wind']['speed']
                    }
                )
        else:
            raise Exception(f"Failed to fetch forecast data: {response.status_code}")

    def perform_create(self, serializer):
        location = self.request.data.get('location')
        if not location:
            raise Exception("Location is required")

        api_key = os.getenv('OPENWEATHER_API_KEY')
        if not api_key:
            raise Exception("OpenWeather API key not found")

        try:
            # Get 5-day forecast data
            response = requests.get(
                f'http://api.openweathermap.org/data/2.5/forecast?q={location}&appid={api_key}&units=metric'
            )
            if response.status_code == 200:
                data = response.json()
                
                # Clear existing forecasts for this location
                WeatherForecast.objects.filter(location=location).delete()
                
                # Process and save forecast data
                for forecast in data['list']:
                    forecast_date = timezone.datetime.fromtimestamp(forecast['dt']).date()
                    weather_data = {
                        'location': location,
                        'forecast_date': forecast_date,
                        'temperature_min': forecast['main']['temp_min'],
                        'temperature_max': forecast['main']['temp_max'],
                        'description': forecast['weather'][0]['description'],
                        'rain_chance': forecast.get('pop', 0) * 100,  # Convert probability to percentage
                        'weather_conditions': {
                            'humidity': forecast['main']['humidity'],
                            'wind_speed': forecast['wind']['speed']
                        }
                    }
                    serializer.save(**weather_data)
            else:
                raise Exception(f"Failed to fetch forecast data: {response.status_code}")
        except Exception as e:
            logger.error(f"Error fetching forecast data: {str(e)}")
            raise

class YelpEventView(viewsets.ModelViewSet):
    queryset = YelpEvent.objects.all()
    serializer_class = YelpEventSerializer
    permission_classes = [AllowAny]

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
        try:
            # Log the data received
            logger.info(f"Creating trip with data: {self.request.data}")
            
            # Check if creator_id exists
            creator_id = self.request.data.get('creator_id')
            if not creator_id:
                logger.error("Missing creator_id in request data")
                raise serializers.ValidationError({"creator_id": "This field is required."})
            
            # Ensure creator_id is an integer
            try:
                if isinstance(creator_id, str) and creator_id.isdigit():
                    creator_id = int(creator_id)
                
                # Check if the user exists
                user = User.objects.get(id=creator_id)
                logger.info(f"Found user: {user.username} (ID: {user.id})")
            except (ValueError, TypeError):
                logger.error(f"Invalid creator_id format: {creator_id}")
                raise serializers.ValidationError({"creator_id": "Invalid creator_id format. Must be an integer."})
            except User.DoesNotExist:
                logger.error(f"User with ID {creator_id} does not exist")
                raise serializers.ValidationError({"creator_id": f"User with ID {creator_id} does not exist."})
            
            # Validate activity_ids
            activity_ids = self.request.data.get('activity_ids', [])
            if activity_ids:
                for activity_id in activity_ids:
                    try:
                        YelpEvent.objects.get(id=activity_id)
                    except YelpEvent.DoesNotExist:
                        logger.error(f"Activity with ID {activity_id} does not exist")
                        raise serializers.ValidationError({"activity_ids": f"Activity with ID {activity_id} does not exist."})
            
            # Validate invited_user_ids
            invited_user_ids = self.request.data.get('invited_user_ids', [])
            if invited_user_ids:
                for user_id in invited_user_ids:
                    try:
                        User.objects.get(id=user_id)
                    except User.DoesNotExist:
                        logger.error(f"User with ID {user_id} does not exist")
                        raise serializers.ValidationError({"invited_user_ids": f"User with ID {user_id} does not exist."})
            
            # Save the trip
            trip = serializer.save()
            logger.info(f"Trip created successfully: {trip}")
            return trip
        except Exception as e:
            logger.error(f"Error creating trip: {str(e)}")
            raise

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

    @action(detail=False, methods=['post'])
    def create_with_string_ids(self, request):
        """
        Custom endpoint to create a trip with string IDs
        """
        try:
            # Log the data received
            logger.info(f"Creating trip with data: {request.data}")
            
            # Get and validate creator_id
            creator_id = request.data.get('creator_id')
            if not creator_id:
                logger.error("Missing creator_id in request data")
                return Response(
                    {"creator_id": "This field is required."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Convert string ID to integer
            try:
                numeric_creator_id = int(creator_id)
                user = User.objects.get(id=numeric_creator_id)
                logger.info(f"Found user: {user.username} (ID: {user.id})")
            except (ValueError, TypeError):
                logger.error(f"Invalid creator_id format: {creator_id}")
                return Response(
                    {"creator_id": "Invalid format. Must be a numeric value."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            except User.DoesNotExist:
                logger.error(f"User with ID {numeric_creator_id} does not exist")
                return Response(
                    {"creator_id": f"User with ID {numeric_creator_id} does not exist."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Prepare data for serializer
            trip_data = request.data.copy()
            trip_data['creator_id'] = numeric_creator_id
            
            # Convert activity_ids if present
            activity_ids = request.data.get('activity_ids', [])
            if activity_ids:
                valid_activity_ids = []
                for activity_id in activity_ids:
                    try:
                        numeric_activity_id = int(activity_id)
                        # Verify the activity exists
                        YelpEvent.objects.get(id=numeric_activity_id)
                        valid_activity_ids.append(numeric_activity_id)
                    except (ValueError, TypeError, YelpEvent.DoesNotExist):
                        logger.warning(f"Invalid or non-existent activity ID: {activity_id}, skipping")
                trip_data['activity_ids'] = valid_activity_ids
            
            # Validate with serializer
            serializer = self.get_serializer(data=trip_data)
            serializer.is_valid(raise_exception=True)
            
            # Save trip
            trip = serializer.save()
            logger.info(f"Trip created successfully: {trip}")
            
            return Response(
                self.get_serializer(trip).data, 
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            logger.error(f"Error in create_with_string_ids: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.action == 'list':
            return UserProfile.objects.filter(user=self.request.user)
        return UserProfile.objects.all()

    def retrieve(self, request, *args, **kwargs):
        if str(kwargs.get('pk')) != str(request.user.id):
            return Response(
                {"error": "You can only access your own profile"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().retrieve(request, *args, **kwargs)
        
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Get the current user's profile, for both Google and Django auth.
        """
        try:
            # The user is already authenticated through JWT, so we can access request.user
            user = request.user
            
            # Attempt to get the user's profile
            try:
                profile = UserProfile.objects.get(user=user)
                serializer = self.get_serializer(profile)
                return Response(serializer.data)
            except UserProfile.DoesNotExist:
                # If profile doesn't exist but user does, create one
                profile = UserProfile.objects.create(user=user)
                serializer = self.get_serializer(profile)
                return Response(serializer.data)
                
        except Exception as e:
            logger.error(f"Error fetching profile for authenticated user: {str(e)}")
            return Response(
                {"error": f"Could not retrieve profile: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def create_or_get_user(request):
    """
    Creates a user based on Google authentication or returns existing user
    """
    try:
        # Extract data from the request
        uid = request.data.get('uid')
        name = request.data.get('name', '')
        email = request.data.get('email', '')
        
        if not uid:
            return Response({"error": "UID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Try to find an existing user with this UID as username
        try:
            # Check if user exists with UID as username
            user = User.objects.get(username=uid)
            logger.info(f"Found existing user with UID {uid}")
            return Response({
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "message": "User found"
            })
        except User.DoesNotExist:
            # Create a new user
            username = uid
            # Create username based on name if provided, otherwise use UID
            if name:
                username = name.lower().replace(' ', '_')
                # Ensure username is unique
                base_username = username
                count = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}_{count}"
                    count += 1
            
            # Create the user
            user = User.objects.create_user(
                username=username,
                email=email,
                # Set a random password since they'll use Google to sign in
                password=User.objects.make_random_password()
            )
            
            # Store the Google UID in a custom field or profile
            profile = user.profile
            # You can add this field to UserProfile model if you want
            # profile.google_uid = uid
            profile.save()
            
            logger.info(f"Created new user with UID {uid} and username {username}")
            return Response({
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "message": "User created"
            }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        logger.error(f"Error in create_or_get_user: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
