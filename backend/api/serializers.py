from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Trip, UserProfile

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

class TripSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    invited_users = UserSerializer(many=True, read_only=True)
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
            'created_at', 'updated_at',
            'invited_users', 'invited_user_ids', 'is_active', 'itinerary'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        if data.get('end_date') and data['end_date'] < data['start_date']:
            raise serializers.ValidationError("End date cannot be before start date")
        return data

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    trips_count = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'profile_picture', 'followers_count', 'following_count', 'trips_count']
        read_only_fields = ['id', 'username', 'followers_count', 'following_count', 'trips_count']

    def get_followers_count(self, obj):
        return obj.followers_count

    def get_following_count(self, obj):
        return obj.following_count

    def get_trips_count(self, obj):
        return obj.trips_count