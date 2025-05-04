import json
import random
import os
from datetime import datetime, timedelta, time
import asyncio
import aiohttp
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
            
    async def fetch_yelp_data(self, activity, r_offset):
        if activity == 'lunch':
            self.pbiz['lunch'] = await get_yelp_results(self.location, ['food'], limit=20)
        elif activity == 'dinner':
            self.pbiz['dinner'] = await get_yelp_results(self.location, ['restaurants'], limit=20)
        else:
            self.pbiz[activity] = await get_yelp_results(self.location, self.category_data[activity], limit=20, offset=r_offset)

    async def build_schedule(self):
        
        lat, lon = await get_coordinates(self.location)
        tasks = []
        
        for activity in self.activities:
            r_offset = random.randint(0, 50)
            tasks.append(self.fetch_yelp_data(activity, r_offset))
        tasks.append(self.fetch_yelp_data('lunch', 0))  # For lunch
        tasks.append(self.fetch_yelp_data('dinner', 0))  # For dinner
        
        await asyncio.gather(*tasks)
        
        for day in self.daterange:
            weather = await get_weather(lat, lon, day)
            itinerary = await self.build_itinerary(day)
            self.schedule[day] = [itinerary, weather]
        
        return self.schedule
    
    async def build_itinerary(self, day):
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
        async def get_unique_business(biz_list):
            for biz in biz_list:
                if biz['id'] not in self.used_businesses:
                    self.used_businesses.add(biz['id'])
                    return parse_yelp_results(biz)
            return None  # fallback if all were used

        lunch = await get_unique_business(self.pbiz['lunch']['businesses'])
        print("✅ Accessed self.pbiz['lunch']['businesses']")

        if lunch:
            itinerary["lunch"] = lunch
            print('✅ Set itinerary["lunch"]')

        dinner = await get_unique_business(self.pbiz['dinner']['businesses'])
        print("✅ Accessed self.pbiz['dinner']['businesses']")

        if dinner:
            itinerary["dinner"] = dinner
            print('✅ Set itinerary["dinner"]')

        # EVENTS
        if self.events:
            events = await get_ticketmaster_events(self.location, ticketmaster_day, self.events)
            print("TYPE EVENTS", type(events))
            try:
                first_event = events[0]  # assuming the list contains one or more valid dicts
                event_parsed = parse_ticketmaster_results(first_event)
                # event_parsed = parse_ticketmaster_results(event['_embedded']['events'][0])
                print("✅ Parsed Ticketmaster event")

                itinerary["evening"] = event_parsed
                print('✅ Set itinerary["evening"]')

                timeslots.remove("evening")
            except IndexError as e:
                print("No events found for the given date range.")
                print(f"Error: {e}")
            

        # NIGHTLIFE
        if "Nightlife" in self.activities:
            night = await get_unique_business(self.pbiz['Nightlife']['businesses'])
            print("✅ Accessed self.pbiz['Nightlife']['businesses']")

            if night:
                itinerary["night"] = night
                print('✅ Set itinerary["night"]')

        # OTHER TIMESLOTS
        for slot in timeslots:
            print(f"🔄 Processing timeslot: {slot}")
            categories = random.sample(self.activities, 2) if len(self.activities) > 2 else self.activities
            for category in categories:
                print(f"  🔍 Checking category: {category}")
                biz = await get_unique_business(self.pbiz[category]['businesses'])
                print(f"✅ Accessed self.pbiz[{category}]['businesses']")

                if biz:
                    itinerary[slot].append(biz)
                    print(f'✅ Added business to itinerary["{slot}"]')

        return itinerary