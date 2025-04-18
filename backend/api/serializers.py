from django.contrib.auth.models import User
from rest_framework import serializers
from .models import WeatherData, YelpEvent, Trip, UserProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
        read_only_fields = ['id']

class WeatherDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherData
        fields = ['id', 'location', 'temperature', 'description', 'timestamp', 'rain_chance', 'weather_conditions']
        read_only_fields = ['id', 'timestamp']

class YelpEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = YelpEvent
        fields = ['id', 'location', 'name', 'rating', 'price', 'categories', 'address', 'phone', 'url', 'image_url', 'timestamp']
        read_only_fields = ['id', 'timestamp']

class TripSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    invited_users = UserSerializer(many=True, read_only=True)
    activities = YelpEventSerializer(many=True, read_only=True)
    creator_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='creator',
        write_only=True
    )
    invited_user_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        source='invited_users',
        write_only=True
    )
    activity_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=YelpEvent.objects.all(),
        source='activities',
        write_only=True
    )

    class Meta:
        model = Trip
        fields = [
            'id', 'creator', 'creator_id', 'start_date', 'end_date',
            'created_at', 'updated_at', 'activities', 'activity_ids',
            'invited_users', 'invited_user_ids', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        if data['end_date'] < data['start_date']:
            raise serializers.ValidationError("End date cannot be before start date")
        return data

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    follower_count = serializers.IntegerField(read_only=True)
    following_count = serializers.IntegerField(read_only=True)
    trips_created_count = serializers.IntegerField(read_only=True)
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'profile_picture', 
                 'follower_count', 'following_count', 'trips_created_count', 
                 'is_following', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user in obj.followers.all()
        return False