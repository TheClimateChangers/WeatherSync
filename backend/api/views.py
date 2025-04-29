import asyncio
from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, viewsets, status
from .serializers import (
    UserSerializer, 
    TripSerializer, 
    UserProfileSerializer, 
    WeatherSerializer,
    ActivitySerializer,
    DayActivitySerializer,
    TripDaySerializer
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Trip, UserProfile, Weather, Activity, DayActivity, TripDay
from .authentication import FirebaseOrJWTAuthentication
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
from .weather import get_weather
from .yelp import get_yelp_results, parse_all_yelp
from .ticketmaster import get_ticketmaster_events, parse_all_ticketmaster
from .trip_manager import TripManager
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)

# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class WeatherViewSet(viewsets.ModelViewSet):
    queryset = Weather.objects.all()
    serializer_class = WeatherSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Weather.objects.all()
        location = self.request.query_params.get('location', None)
        date = self.request.query_params.get('date', None)
        
        if location:
            queryset = queryset.filter(location__icontains=location)
        if date:
            queryset = queryset.filter(date=date)
            
        return queryset

class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Activity.objects.all()
        location = self.request.query_params.get('location', None)
        source = self.request.query_params.get('source', None)
        category = self.request.query_params.get('category', None)
        
        if location:
            queryset = queryset.filter(location__icontains=location)
        if source:
            queryset = queryset.filter(source=source)
        if category:
            # Search in the categories JSONField
            queryset = queryset.filter(categories__contains=[category])
            
        return queryset

class DayActivityViewSet(viewsets.ModelViewSet):
    queryset = DayActivity.objects.all()
    serializer_class = DayActivitySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = DayActivity.objects.all()
        time_slot = self.request.query_params.get('time_slot', None)
        
        if time_slot:
            queryset = queryset.filter(time_slot=time_slot)
            
        return queryset

class TripDayViewSet(viewsets.ModelViewSet):
    queryset = TripDay.objects.all()
    serializer_class = TripDaySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = TripDay.objects.all()
        date = self.request.query_params.get('date', None)
        trip_id = self.request.query_params.get('trip_id', None)
        
        if date:
            queryset = queryset.filter(date=date)
        if trip_id:
            queryset = queryset.filter(trip__id=trip_id)
            
        return queryset
    
class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Trip.objects.all()
        location = self.request.query_params.get('location', None)
        creator_id = self.request.query_params.get('creator_id', None)
        
        if location:
            queryset = queryset.filter(location__icontains=location)
        if creator_id:
            queryset = queryset.filter(creator_id=creator_id)
            
        return queryset

    @action(detail=True, methods=['post'])
    def generate_itinerary(self, request, pk=None):
        """
        Generate an itinerary for an existing trip
        """
        trip = self.get_object()

        try:
            # Optional: get custom activity types and events from request
            activities = request.data.get('activities', ['Food & Drink', 'Arts & Culture', 'Nightlife'])
            events = request.data.get('events', ['Music', 'Sports', 'Art'])

            # Prepare user data for the ItineraryBuilder
            user_data = {
                'location': trip.location,
                'daterange': [str(trip.start_date), str(trip.end_date)],
                'activities': activities,
                'events': events
            }

            # Generate itinerary using TripManager's method (which uses ItineraryBuilder)
            schedule = async_to_sync(TripManager.generate_itinerary)(trip)


            # Optionally, save itinerary to the database here
            TripManager.save_itinerary(trip, schedule)

            return Response(
                {"message": "Itinerary generated successfully", "itinerary": schedule},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            logger.error(f"Error generating itinerary: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
            
            # Validate with serializer
            serializer = self.get_serializer(data=trip_data)
            serializer.is_valid(raise_exception=True)
            
            # Save trip (the serializer.create method will automatically generate the itinerary)
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
    
    # Use our custom authentication class
    authentication_classes = [FirebaseOrJWTAuthentication]

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
            logger.info(f"Profile requested for user: {user.username}")
            
            # Attempt to get the user's profile
            try:
                profile = UserProfile.objects.get(user=user)
                serializer = self.get_serializer(profile)
                return Response(serializer.data)
            except UserProfile.DoesNotExist:
                # If profile doesn't exist but user does, create one
                logger.info(f"Creating new profile for user: {user.username}")
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

@api_view(['GET'])
def get_weather_data(request):
    latitude = request.query_params.get('latitude')
    longitude = request.query_params.get('longitude')
    date = request.query_params.get('date')
    
    if not latitude or not longitude or not date:
        return Response({"error": "Latitude, longitude, and date are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        weather_data = get_weather(latitude, longitude, date)
        return Response(weather_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_yelp_data(request):
    location = request.query_params.get('location')
    categories = request.query_params.get('categories')
    limit = request.query_params.get('limit', 3)
    offset = request.query_params.get('offset', 0)
    
    if not location or not categories:
        return Response({"error": "Location, Categories required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        yelp_data = get_yelp_results(location, categories, limit=limit, offset=offset)
        parsed = parse_all_yelp(yelp_data)
        return Response(parsed, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_ticketmaster_data(request):
    location = request.query_params.get('city')
    date = request.query_params.get('date')
    categories = request.query_params.get('segmentName')
    size = request.query_params.get('size', 1)
    
    if not location or not date or not categories:
        return Response({"error": "City, Date, Categories required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        ticketmaster_data = get_ticketmaster_events(location, date, categories, size=size)
        parsed = parse_all_ticketmaster(ticketmaster_data)
        return Response(parsed, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

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
