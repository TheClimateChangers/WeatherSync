import os
import sys
import django

# Move sys.path up to the WeatherSync folder
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Now Django can find backend/backend/settings.py
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

django.setup()

from rest_framework.routers import DefaultRouter
from api.views import UserProfileViewSet, TripViewSet, WeatherViewSet, ActivityViewSet, DayActivityViewSet, TripDayViewSet

router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'trips', TripViewSet, basename='trip')
router.register(r'weather', WeatherViewSet, basename='weather')
router.register(r'activities', ActivityViewSet, basename='activity')
router.register(r'day-activities', DayActivityViewSet, basename='day-activity')
router.register(r'trip-days', TripDayViewSet, basename='trip-day')

for urlpattern in router.urls:
    print(f'Path: {urlpattern.pattern}\nName: {urlpattern.name}\n')
