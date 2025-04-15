from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NoteViewSet, WeatherDataView, YelpEventView

router = DefaultRouter()
router.register(r'notes', NoteViewSet)
router.register(r'weather', WeatherDataView, basename='weather')
router.register(r'yelp-events', YelpEventView, basename='yelp-events')

urlpatterns = [
    path('', include(router.urls)),
]
