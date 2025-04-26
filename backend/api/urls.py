from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserProfileViewSet, TripViewSet, create_or_get_user, get_ticketmaster_data, get_yelp_data, get_weather

router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'trips', TripViewSet, basename='trip')

# Keep auth/google-user as a separate URL pattern since it's not a viewset
urlpatterns = [
    path('', include(router.urls)),
    path('auth/google-user/', create_or_get_user, name='create-or-get-user'),
    path('activities/', get_yelp_data, name='get-yelp-data'),
    path('events/', get_ticketmaster_data, name='get-ticketmaster-data'),
    path('weather/', get_weather, name='get-weather'),
]
