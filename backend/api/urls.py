from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WeatherDataView, YelpEventView, TripViewSet

router = DefaultRouter()
router.register(r'weather', WeatherDataView, basename='weather')
router.register(r'events', YelpEventView, basename='events')
router.register(r'trips', TripViewSet, basename='trips')

urlpatterns = [
    path('', include(router.urls)),
]
