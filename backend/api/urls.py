from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserProfileViewSet, 
    TripViewSet, 
    WeatherViewSet,
    ActivityViewSet,
    DayActivityViewSet,
    TripDayViewSet,
    create_or_get_user, 
    get_ticketmaster_data, 
    get_yelp_data, 
    get_weather_data,
    ItineraryView
)

router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'trips', TripViewSet, basename='trip')
router.register(r'weather', WeatherViewSet, basename='weather')
router.register(r'activities', ActivityViewSet, basename='activity')
router.register(r'day-activities', DayActivityViewSet, basename='day-activity')
router.register(r'trip-days', TripDayViewSet, basename='trip-day')

# URLs that aren't handled by the router
urlpatterns = [
    path('', include(router.urls)),
    path('auth/google-user/', create_or_get_user, name='create-or-get-user'),
    path('yelp-activities/', get_yelp_data, name='get-yelp-data'),
    path('ticketmaster-events/', get_ticketmaster_data, name='get-ticketmaster-data'),
    path('weather-data/', get_weather_data, name='get-weather-data'),
    path('generate-itinerary/', ItineraryView.as_view(), name='generate-itinerary'),
]
