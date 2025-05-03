from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Trip, UserProfile, Weather, Activity, DayActivity, TripDay

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        read_only_fields = ['id']
        
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class WeatherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Weather
        fields = ['id', 'location', 'date', 'temperature', 'description', 
                  'rain_chance', 'weather_conditions', 'timestamp']
        read_only_fields = ['id', 'timestamp']

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'location', 'name', 'rating', 'price', 'categories', 
                  'address', 'phone', 'url', 'image_url', 'timestamp', 
                  'start_time', 'end_time', 'source', 'external_id']
        read_only_fields = ['id', 'timestamp']

class DayActivitySerializer(serializers.ModelSerializer):
    activity = ActivitySerializer(read_only=True)
    activity_id = serializers.PrimaryKeyRelatedField(
        queryset=Activity.objects.all(),
        source='activity',
        write_only=True
    )
    
    class Meta:
        model = DayActivity
        fields = ['id', 'activity', 'activity_id', 'time_slot', 'order', 'notes']
        read_only_fields = ['id']

class TripDaySerializer(serializers.ModelSerializer):
    weather = WeatherSerializer(read_only=True)
    weather_id = serializers.PrimaryKeyRelatedField(
        queryset=Weather.objects.all(),
        source='weather',
        write_only=True,
        required=False
    )
    activities = DayActivitySerializer(many=True, read_only=True)
    
    class Meta:
        model = TripDay
        fields = ['id', 'date', 'weather', 'weather_id', 'activities']
        read_only_fields = ['id']

class TripSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    invited_users = UserSerializer(many=True, read_only=True)
    days = TripDaySerializer(many=True, read_only=True)
    activities = ActivitySerializer(many=True, read_only=True)
    creator_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='creator',
        write_only=True
    )
    invited_user_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        source='invited_users',
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Trip
        fields = [
            'id', 'creator', 'creator_id', 'location', 'start_date', 'end_date',
            'created_at', 'updated_at', 'activities', 'days',
            'invited_users', 'invited_user_ids', 'is_active', 'itinerary'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'activities', 'days', 'itinerary']

    def validate(self, data):
        if data.get('end_date') and data['end_date'] < data['start_date']:
            raise serializers.ValidationError("End date cannot be before start date")
        return data
    
    def create(self, validated_data):
        trip = Trip.objects.create(
            creator=validated_data['creator'],
            location=validated_data['location'],
            start_date=validated_data['start_date'],
            end_date=validated_data['end_date'],
            is_active=validated_data.get('is_active', True)
        )
        
        # Add invited users if provided
        invited_users = validated_data.get('invited_users', [])
        for user in invited_users:
            trip.invited_users.add(user)
        
        # Generate the itinerary
        # trip.generate_itinerary()
        
        return trip

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    trips_count = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'id', 'username', 'email', 'profile_picture', 
            'nickname', 'bio', 'followers_count', 'following_count', 
            'trips_count'
        ]
        read_only_fields = ['id', 'username', 'email', 'followers_count', 'following_count', 'trips_count']

    def get_followers_count(self, obj):
        return obj.followers_count

    def get_following_count(self, obj):
        return obj.following_count

    def get_trips_count(self, obj):
        return obj.trips_count