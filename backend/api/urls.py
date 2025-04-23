from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserProfileViewSet, WeatherDataView, YelpEventView, TripViewSet, WeatherForecastView, create_or_get_user, exchange_firebase_token

router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'trips', TripViewSet, basename='trip')
router.register(r'weather', WeatherDataView, basename='weather')
router.register(r'weather-forecast', WeatherForecastView, basename='weather-forecast')
router.register(r'yelp-events', YelpEventView, basename='yelp-events')

# Keep auth routes as separate URL patterns since they're not viewsets
urlpatterns = [
    path('', include(router.urls)),
    path('auth/google-user/', create_or_get_user, name='create-or-get-user'),
    path('auth/exchange-firebase-token/', exchange_firebase_token, name='exchange-firebase-token'),
]
