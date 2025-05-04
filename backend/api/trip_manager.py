from django.contrib.auth import get_user_model
from django.utils import timezone
from asgiref.sync import async_to_sync
from datetime import datetime, timedelta

User = get_user_model()

class TripManager:
    
    @staticmethod
    async def generate_itinerary(trip):
        from .itinerary import ItineraryBuilder
        
        # Prepare the date range
        date_range = []
        current_date = datetime.strptime(trip['daterange'][0], "%Y-%m-%d").date()
        end_date = datetime.strptime(trip['daterange'][1], "%Y-%m-%d").date()
        location = trip.get('location')
        activities = trip.get('activities')
        events = trip.get('events')
        
        while current_date <= end_date:
            date_range.append(current_date.strftime("%Y-%m-%d"))
            current_date += timezone.timedelta(days=1)
            
            """
            user_data = {
                'location': trip.location,
                'daterange': [str(trip.start_date), str(trip.end_date)],
                'activities': activities,
                'events': events
            }"""
        
        # Prepare user data for the ItineraryBuilder
        user_data = {
            'location': location,
            'daterange': date_range,
            'activities': activities,
            'events': events
        }
        
        # Generate the itinerary
        builder = ItineraryBuilder(user_data)
        schedule = await builder.build_schedule()
        
        return schedule
    
    @staticmethod
    def save_itinerary(trip, schedule):
        from .models import TripDay, DayActivity, Activity, Weather
        """
        Save the itinerary to the database for a given trip instance.
        """
        # Save the legacy itinerary field (optional)
        trip.itinerary = schedule
        trip.save()
        
        # Create TripDay, Weather, Activity, and DayActivity objects
        for date_str, data in schedule.items():
            itinerary, weather_data = data
            
            # Create or get Weather object
            weather, _ = Weather.objects.update_or_create(
                location=trip.location,
                date=timezone.datetime.strptime(date_str, "%Y-%m-%d").date(),
                defaults={
                    'temperature': weather_data.get('temperature', 0),
                    'description': 'Weather forecast',
                    'rain_chance': weather_data.get('precipitation', 0) * 100,
                    'weather_conditions': {
                        'cloud_cover': weather_data.get('cloud_cover', 0),
                        'wind': weather_data.get('wind', 0),
                        'humidity': weather_data.get('humidity', 0)
                    }
                }
            )
            
            # Create TripDay
            trip_day = TripDay.objects.create(
                date=timezone.datetime.strptime(date_str, "%Y-%m-%d").date(),
                weather=weather
            )
            
            # Add TripDay to Trip
            trip.days.add(trip_day)
            
            # Process activities for each time slot
            for time_slot, activities in itinerary.items():
                if not activities:
                    continue
                
                activity_list = activities if isinstance(activities, list) else [activities]
                
                for order, activity_data in enumerate(activity_list):
                    # Create or get Activity
                    activity, _ = Activity.objects.update_or_create(
                        name=activity_data.get('name', 'Unknown'),
                        location=trip.location,
                        defaults={
                            'rating': activity_data.get('rating'),
                            'url': activity_data.get('url'),
                            'image_url': activity_data.get('image_url'),
                            'address': activity_data.get('location', {}).get('address'),
                            'categories': [activity_data.get('category', 'Other')],
                            'start_time': activity_data.get('start_time'),
                            'end_time': activity_data.get('end_time'),
                            'source': 'YELP' if 'rating' in activity_data else 'TICKETMASTER',
                            'external_id': activity_data.get('id')
                        }
                    )
                    
                    # Add Activity to Trip's activities
                    trip.activities.add(activity)
                    
                    # Create DayActivity
                    day_activity = DayActivity.objects.create(
                        activity=activity,
                        time_slot=time_slot,
                        order=order
                    )
                    
                    # Add DayActivity to TripDay
                    trip_day.activities.add(day_activity)
        
        return schedule
    
    @staticmethod
    def add_user():
        pass
    
    @staticmethod
    def remove_user():
        pass
    
    @staticmethod
    def add_day():
        pass
    
    @staticmethod
    def remove_day():
        pass
    
    @staticmethod
    def add_activity():
        pass
    
    @staticmethod
    def remove_activity():
        pass
    
    @staticmethod
    def add_event():
        pass
    
    @staticmethod
    def remove_event():
        pass