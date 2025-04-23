from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserProfileViewSet, WeatherDataView, YelpEventView, TripViewSet, WeatherForecastView

router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'trips', TripViewSet, basename='trip')
router.register(r'weather', WeatherDataView, basename='weather')
router.register(r'weather-forecast', WeatherForecastView, basename='weather-forecast')
router.register(r'yelp-events', YelpEventView, basename='yelp-events')

urlpatterns = [
    path('', include(router.urls)),
]
