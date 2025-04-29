from django.test import SimpleTestCase
from django.urls import reverse, resolve
from api.views import UserProfileViewSet, TripViewSet, WeatherViewSet, ActivityViewSet, DayActivityViewSet, TripDayViewSet

"""
profile-list
profile-followers
profile-following
profile-me
profile-detail <pk>
profile-follow <pk>

trip-list
trip-create-with-string-ids 
+ trip-detail <pk>
+ trip-generate-itinerary <pk>
+ trip-invite-user <pk>

weather-list
+ weather-detail <pk>

activity-list
+ activity-detail <pk>

day-activity-list
+ day-activity-detail <pk>

trip-day-list
+ trip-day-detail <pk>
"""

class TestUrls(SimpleTestCase):
    
    #USER
    def test_profile_list_url_resolves(self):
        url = reverse('profile-list')
        resolved = resolve(url)
        self.assertEqual(resolved.func.cls, UserProfileViewSet)
        
    def test_profile_followers_url_resolves(self):
        url = reverse('profile-followers')
        resolved = resolve(url)
        self.assertEqual(resolved.func.cls, UserProfileViewSet)
        
    def test_profile_following_url_resolves(self):
        url = reverse('profile-following')
        resolved = resolve(url)
        self.assertEqual(resolved.func.cls, UserProfileViewSet)
        
    def test_profile_me_url_resolves(self):
        url = reverse('profile-me')
        resolved = resolve(url)
        self.assertEqual(resolved.func.cls, UserProfileViewSet)
        
    def test_profile_detail_url_resolves(self):
        url = reverse('profile-detail', kwargs={'pk': 5, 'format': 'json'})
        resolved = resolve(url)
        self.assertEqual(resolved.func.cls, UserProfileViewSet)
        
    def test_profile_follow_url_resolves(self):
        url = reverse('profile-follow', kwargs={'pk': 5, 'format': 'json'})
        resolved = resolve(url)
        self.assertEqual(resolved.func.cls, UserProfileViewSet)
    
    #TRIP
    def test_trip_list_url_resolves(self):
        url = reverse('trip-list')
        resolved = resolve(url)
        self.assertEqual(resolved.func.cls, TripViewSet)
        
    def test_trip_create_with_string_ids_url_resolves(self):
        url = reverse('trip-create-with-string-ids')
        resolved = resolve(url)
        self.assertEqual(resolved.func.cls, TripViewSet)
        
    def test_trip_detail_url_resolves(self):
        url = reverse('trip-detail', kwargs={'pk': 5, 'format': 'json'})
        resolved = resolve(url)
        self.assertEquals(resolved.func.cls, TripViewSet)
        
    def test_trip_generate_itinerary_url_resolves(self):
        url = reverse('trip-generate-itinerary', kwargs={'pk': 5, 'format': 'json'})
        resolved = resolve(url)
        self.assertEquals(resolved.func.cls, TripViewSet)
        
    def test_trip_invite_user_url_resolves(self):
        url = reverse('trip-invite-user', kwargs={'pk': 5, 'format': 'json'})
        resolved = resolve(url)
        self.assertEquals(resolved.func.cls, TripViewSet)
        
    #WEATHER
    def test_weather_list_url_resolves(self):
        url = reverse('weather-list')
        resolved = resolve(url)
        self.assertEqual(resolved.func.cls, WeatherViewSet)
        
    def test_weather_detail_url_resolves(self):
        url = reverse('weather-detail', kwargs={'pk': 5, 'format': 'json'})
        resolved = resolve(url)
        self.assertEqual(resolved.func.cls, WeatherViewSet)
    #ACTIVITY
    def test_activity_list_url_resolves(self):
        url = reverse('activity-list')
        resolved = resolve(url)
        self.assertEqual(resolved.func.cls, ActivityViewSet)
        
    def test_activity_detail_url_resolves(self):
        url = reverse('activity-detail', kwargs={'pk': 5, 'format': 'json'})
        resolved = resolve(url)
        self.assertEqual(resolved.func.cls, ActivityViewSet)
    #DAY ACTIVITY
    def test_day_activity_list_url_resolves(self):
        url = reverse('day-activity-list')
        resolved = resolve(url)
        self.assertEqual(resolved.func.cls, DayActivityViewSet)
        
    def test_day_activity_detail_url_resolves(self):
        url = reverse('day-activity-detail', kwargs={'pk': 5, 'format': 'json'})
        resolved = resolve(url)
        self.assertEqual(resolved.func.cls, DayActivityViewSet)
    #TRIP DAY
    def test_trip_day_list_url_resolves(self):
        url = reverse('trip-day-list')
        resolved = resolve(url)
        self.assertEqual(resolved.func.cls, TripDayViewSet)
        
    def test_trip_day_detail_url_resolves(self):
        url = reverse('trip-day-detail', kwargs={'pk': 5, 'format': 'json'})
        resolved = resolve(url)
        self.assertEqual(resolved.func.cls, TripDayViewSet)