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
    add_next_trip_day,
    delete_trip_day,
    delete_trip
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
    path('trips/<int:trip_id>/add-day/', add_next_trip_day, name='add-day-to-trip'),
    path("trips/<int:trip_id>/days/<int:day_id>/delete/", delete_trip_day, name="delete_trip_day"),
    path('trips/<int:trip_id>/delete/', delete_trip, name='delete_trip')
]
