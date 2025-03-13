from django.test import TestCase
from unittest.mock import patch, MagicMock
from io import StringIO
from .models import WeatherData

# Create your tests here.
class WeatherServiceTest(TestCase):
    """Test the WeatherService methods"""
    
    # Test 1
    @patch('requests.get')
    def test_fetch_weather(self, mock_get):
        """Test fetching weather from OpenWeatherMap API"""
        from .services import WeatherService
        
        # Setup mock response
        mock_response = MagicMock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {
            'main': {
                'temp': 18.5,
                'humidity': 75
            },
            'weather': [
                {
                    'main': 'Clouds',
                    'description': 'scattered clouds'
                }
            ],
            'clouds': {
                'all': 20
            },
            'wind': {
                'speed': 3.1
            }
        }
        mock_get.return_value = mock_response
        
        # Call the service
        weather = WeatherService.fetch_weather('San Francisco')
        
        # Assertions
        self.assertEqual(weather['location'], 'San Francisco')
        self.assertEqual(weather['temperature'], 18.5)
        self.assertEqual(weather['rain_chance'], 0.2)  # 20% converted to decimal
        self.assertEqual(weather['weather_conditions']['main'], 'Clouds')
        
        # Verify the correct API call was made
        mock_get.assert_called_once()
        args, kwargs = mock_get.call_args
        self.assertIn('q', kwargs['params'])
        self.assertEqual(kwargs['params']['q'], 'San Francisco')
        self.assertEqual(kwargs['params']['units'], 'metric')


    # Test 2
    @patch('requests.get')
    def test_fetch_weather_api_error(self, mock_get):
        from .services import WeatherService
        mock_response = MagicMock()
        mock_response.raise_for_status.side_effect = Exception("API error")
        mock_get.return_value = mock_response

        with self.assertRaises(Exception):
            WeatherService.fetch_weather('Nowhere')


    # Test 3
    @patch('requests.get')
    def test_fetch_weather_incomplete_data(self, mock_get):
        from .services import WeatherService
        mock_response = MagicMock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {
            'main': {},
            'weather': [{}],
            'clouds': {},
            'wind': {}
        }
        mock_get.return_value = mock_response

        weather = WeatherService.fetch_weather('TestCity')
        self.assertIsNone(weather.get('temperature'))
        self.assertIsNone(weather.get('rain_chance'))


    # Test 4
    @patch('requests.get')
    def test_weather_data_validation(self, mock_get):
        """Test weather data validation and processing logic"""
        from .services import WeatherService
        
        # Test case 1: Valid temperature range
        mock_response = MagicMock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {
            'main': {
                'temp': 25.5,
                'humidity': 65
            },
            'weather': [
                {
                    'main': 'Clear',
                    'description': 'clear sky'
                }
            ],
            'clouds': {
                'all': 10
            },
            'wind': {
                'speed': 5.2
            }
        }
        mock_get.return_value = mock_response
        
        # Test normal weather conditions
        weather = WeatherService.fetch_weather('London')
        self.assertEqual(weather['temperature'], 25.5)
        self.assertEqual(weather['location'], 'London')
        self.assertEqual(weather['rain_chance'], 0.1)  # 10% cloud coverage
        self.assertEqual(weather['weather_conditions']['main'], 'Clear')
        self.assertEqual(weather['weather_conditions']['wind_speed'], 5.2)
        
        # Test case 2: Extreme weather conditions
        mock_response.json.return_value = {
            'main': {
                'temp': -50.0,
                'humidity': 85
            },
            'weather': [
                {
                    'main': 'Snow',
                    'description': 'heavy snow'
                }
            ],
            'clouds': {
                'all': 100
            },
            'wind': {
                'speed': 20.0
            }
        }
        
        # Test extreme weather conditions
        weather = WeatherService.fetch_weather('Antarctica')
        self.assertEqual(weather['temperature'], -50.0)
        self.assertEqual(weather['rain_chance'], 1.0)  # 100% cloud coverage
        self.assertEqual(weather['weather_conditions']['main'], 'Snow')
        self.assertEqual(weather['weather_conditions']['wind_speed'], 20.0)

