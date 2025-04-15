from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WeatherDataView, YelpEventView, CreateUserView

router = DefaultRouter()
router.register(r'weather', WeatherDataView, basename='weather')
router.register(r'yelp-events', YelpEventView, basename='yelp-events')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', CreateUserView.as_view(), name='register'),
]
