import json
import random
import os
from datetime import datetime, timedelta, time
from .yelp import get_yelp_results, parse_yelp_results
from .ticketmaster import get_ticketmaster_events, parse_ticketmaster_results
from .weather import get_weather
from .geocode import get_coordinates

class ItineraryBuilder:
    def __init__(self, user_data):
        # user data
        self.activities = user_data['activities']
        self.events = user_data['events']
        self.location = user_data['location']
        self.daterange = user_data['daterange']
        # b
        self.used_businesses = set()
        self.used_categories = set()
        self.schedule = {}
        self.pbiz = {}

        # Load your Yelp category structure
        file_path = os.path.join(os.path.dirname(__file__), "yelp_categories.json")
        with open(file_path, "r") as f:
            self.category_data = json.load(f)
        
    def build_schedule(self):
        
        lat, lon = get_coordinates(self.location)
        
        for activity in self.activities:
            r_offset = random.randint(0, 50)
            self.pbiz[activity] = get_yelp_results(self.location, self.category_data[activity], limit=20, offset=r_offset)
        self.pbiz['lunch'] = get_yelp_results(self.location, ['food'], limit=20)
        self.pbiz['dinner'] = get_yelp_results(self.location, ['restaurants'], limit=20)

        for day in self.daterange:
            weather = get_weather(lat, lon, day)
            itinerary = self.build_itinerary(day)
            self.schedule[day] = [itinerary, weather]
            
        return self.schedule
    
    def build_itinerary(self, day):
        timeslots = ["morning", "afternoon", "evening"]
        ticketmaster_day = f"{day}T10:00:00,{day}T22:00:00"
        itinerary = {
            "morning": [],
            "lunch": [],
            "afternoon": [],
            "dinner": [],
            "evening": [],
            "night": []
        }

        # Helper to get a unique business
        def get_unique_business(biz_list):
            for biz in biz_list:
                if biz['id'] not in self.used_businesses:
                    self.used_businesses.add(biz['id'])
                    return parse_yelp_results(biz)
            return None  # fallback if all were used

        # LUNCH
        lunch = get_unique_business(self.pbiz['lunch']['businesses'])
        if lunch:
            itinerary["lunch"] = lunch

        # DINNER
        dinner = get_unique_business(self.pbiz['dinner']['businesses'])
        if dinner:
            itinerary["dinner"] = dinner

        # EVENTS
        if self.events:
            event = get_ticketmaster_events(self.location, ticketmaster_day, self.events)
            event_parsed = parse_ticketmaster_results(event['_embedded']['events'][0])
            itinerary["evening"] = event_parsed
            timeslots.remove("evening")

        # NIGHTLIFE
        if "NIGHTLIFE" in self.activities:
            night = get_unique_business(self.pbiz['NIGHTLIFE']['businesses'])
            if night:
                itinerary["night"] = night

        # OTHER TIMESLOTS
        for slot in timeslots:
            categories = random.sample(self.activities, 2)
            for category in categories:
                biz = get_unique_business(self.pbiz[category]['businesses'])
                if biz:
                    itinerary[slot].append(biz)

        return itinerary