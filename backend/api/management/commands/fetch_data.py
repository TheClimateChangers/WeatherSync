# management/commands/fetch_data.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from ...services import EventbriteService, WeatherService


class Command(BaseCommand):
    help = 'Fetch events from Eventbrite and weather data from OpenWeatherMap'

    def add_arguments(self, parser):
        parser.add_argument('--location', type=str, default='San Francisco', help='City name')
        parser.add_argument('--days', type=int, default=7, help='Number of days to look ahead')

    def handle(self, *args, **options):
        location = options['location']
        days = options['days']
        
        # Calculate date range
        today = timezone.now().date()
        end_date = today + timezone.timedelta(days=days)
        
        # Format dates for API
        start_date_str = today.strftime('%Y-%m-%d')
        end_date_str = end_date.strftime('%Y-%m-%d')
        
        # Fetch and save events
        self.stdout.write(f"Fetching events for {location} from {start_date_str} to {end_date_str}...")
        events = EventbriteService.fetch_events(location, start_date_str, end_date_str)
        count = EventbriteService.save_events(events)
        self.stdout.write(self.style.SUCCESS(f"Successfully saved {count} new events"))
        
        # Fetch and save weather data
        self.stdout.write(f"Fetching current weather for {location}...")
        weather_data = WeatherService.fetch_weather(location)
        if weather_data:
            weather = WeatherService.save_weather_data(weather_data)
            if weather:
                self.stdout.write(self.style.SUCCESS("Successfully saved weather data"))
            else:
                self.stdout.write(self.style.ERROR("Failed to save weather data"))
        else:
            self.stdout.write(self.style.ERROR("Failed to fetch weather data"))