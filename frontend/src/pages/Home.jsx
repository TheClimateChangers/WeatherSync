import React, { useState } from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';
import api from '../api';
import Weather from '../components/Weather';
import YelpEvents from '../components/YelpEvents';
import '../styles/Home.css';
import '../styles/Weather.css';
import { LoadScript } from '@react-google-maps/api';
import { getWeather, getForecast } from '../api';

const GOOGLE_MAP_LIBRARIES = ['places'];

function Home() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [location, setLocation] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const [weatherData, forecastData] = await Promise.all([
        getWeather(location),
        getForecast(location)
      ]);
      setWeather(weatherData);
      setForecast(forecastData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Weather Forecast</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter city name"
            className="flex-1 p-2 border rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Weather'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {weather && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Current Weather</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-xl">Temperature: {weather.temperature}°C</p>
            <p className="text-xl">Conditions: {weather.conditions}</p>
          </div>
        </div>
      )}

      {forecast && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">5-Day Forecast</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {forecast.map((day, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <p className="font-semibold">Day {index + 1}</p>
                <p>High: {day.max_temp}°C</p>
                <p>Low: {day.min_temp}°C</p>
                <p>Conditions: {day.conditions}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
