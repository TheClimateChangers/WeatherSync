from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, viewsets, status
from .serializers import UserSerializer, TripSerializer, UserProfileSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Trip, UserProfile
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
from .itinerary import ItineraryBuilder
from .weather import get_weather
from .yelp import get_yelp_results, parse_all_yelp
from .ticketmaster import get_ticketmaster_events, parse_all_ticketmaster

logger = logging.getLogger(__name__)

# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Trip.objects.all()

    def perform_create(self, serializer):
        try:
            # Extract the necessary data from the request for itinerary generation
            user_data = {
                "location": self.request.data.get("location"),
                "daterange": self.request.data.get("daterange"),
                "activities": self.request.data.get("activities"),
                "events": self.request.data.get("events", [])
            }
            
            # Validate the required fields
            if not all([user_data["location"], user_data["daterange"], user_data["activities"]]):
                logger.error("Missing required fields for itinerary")
                raise serializers.ValidationError({"error": "Missing required fields"})
            
            # Initialize the itinerary builder
            builder = ItineraryBuilder(user_data)
            schedule = builder.build_schedule()
            
            if self.request.user.is_authenticated:
                creator = self.request.user
            else:
                creator, created = User.objects.get_or_create(username='default_user', email='default_user@example.com')

            # Now you can create the Trip object
            trip = serializer.save(creator=creator)

            # Attach the itinerary to the trip or store it elsewhere, depending on your data model
            # For example, saving the itinerary to the trip model (if needed)
            trip.itinerary = schedule  # assuming itinerary is a field on your Trip model
            trip.save()
            logger.info(f"Trip created successfully with itinerary: {trip}")

            return trip
        except Exception as e:
            logger.error(f"Error creating trip: {str(e)}")
            raise

    @action(detail=True, methods=['post']) #TODO: Need to update this logic
    def perform_update(self, serializer):
        pass

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

class ItineraryView(APIView):
    def post(self, request):
        try:
            user_data = {
                "location": request.data.get("location"),
                "daterange": request.data.get("daterange"),
                "activities": request.data.get("activities"),
                "events": request.data.get("events", [])
            }
            if not all([user_data["location"], user_data["daterange"], user_data["activities"]]):
                return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
            
            builder = ItineraryBuilder(user_data)
            schedule = builder.build_schedule()
            
            return Response({"itinerary": schedule}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
        ticketmaster_data = get_ticketmaster_data(location, date, categories, size=size)
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
