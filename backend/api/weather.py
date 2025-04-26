import requests

API_KEY = "2ef5457d3740b15926588d09a68c24da"
API_URL = "https://api.openweathermap.org/data/3.0/onecall/day_summary"

def get_weather(latitude, longitude, date):
    """
    input: latitude, longitude, date (YYYY-MM-DD)
    output: weather info dict
    """

    params = {
        "appid": API_KEY,
        "lat": latitude,
        "lon": longitude,
        "date": date,
        "units": "imperial"    
    }

    weather_data = {
        "date": date,
        "latitude": latitude,
        "longitude": longitude,
        "temperature": 75,
        "cloud_cover": 0,
        "wind": 10,
        "humidity": 50,
        "precipitation": 0
    }
    
    try:
        response = requests.get(API_URL, params=params)
        response.raise_for_status()
        r = response.json()
        
        weather_data['temperature'] = r['temperature']['afternoon']
        weather_data['cloud_cover'] = r['cloud_cover']['afternoon']
        weather_data['wind'] = r['wind']['max']['speed']
        weather_data['humidity'] = r['humidity']['afternoon']
        weather_data['precipitation'] = r['precipitation']['total']
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
    except KeyError as e:
        print(f"Missing expected data in API response: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    
    return weather_data