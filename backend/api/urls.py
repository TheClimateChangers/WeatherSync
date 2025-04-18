from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserProfileViewSet, WeatherDataView, YelpEventView, TripViewSet, CreateUserView

router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'trips', TripViewSet, basename='trip')
router.register(r'weather', WeatherDataView, basename='weather')
router.register(r'yelp-events', YelpEventView, basename='yelp-events')

urlpatterns = [
    path('', include(router.urls)),
    path('user/register/', CreateUserView.as_view(), name='user-register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
