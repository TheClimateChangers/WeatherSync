import React, { useState } from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';
import Weather from './Weather';
import YelpEvents from './YelpEvents';
import '../styles/Home.css';

function LocationSearch() {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (address) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch weather data
      const weatherResponse = await fetch(`${import.meta.env.VITE_URL_API}/api/weather/?location=${encodeURIComponent(address)}`);
      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }
      const weatherData = await weatherResponse.json();
      setWeather(weatherData);

      // Fetch events data
      const eventsResponse = await fetch(`${import.meta.env.VITE_URL_API}/api/events/?location=${encodeURIComponent(address)}`);
      if (!eventsResponse.ok) {
        throw new Error('Failed to fetch events data');
      }
      const eventsData = await eventsResponse.json();
      setEvents(eventsData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (address) => {
    setLocation(address);
    await fetchData(address);
  };

  return (
    <div>
      <div className="pb-5">
        <PlacesAutocomplete
          value={location}
          onChange={setLocation}
          onSelect={handleSelect}
          searchOptions={{ types: ['(cities)'] }}
        >
          {({
            getInputProps,
            suggestions,
            getSuggestionItemProps,
            loading: placesLoading,
          }) => (
            <div>
              <input
                {...getInputProps({
                  placeholder: 'Search for a city...',
                  className:
                    'bg-white w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition ease-in-out duration-100',
                })}
              />
              <div className="w-md mx-auto space-y-2">
                {placesLoading && <div className="px-4 py-2 text-gray-500">Loading...</div>}
                {suggestions.map((suggestion, index) => {
                  const className = suggestion.active
                    ? 'bg-orange-100 text-white rounded-lg'
                    : 'hover:bg-orange-500 rounded-lg';
                  const { key, ...itemProps } = getSuggestionItemProps(
                    suggestion,
                    {
                      className: `flex items-center justify-center w-full px-4 py-2 cursor-pointer ${className}`
                    }
                  );
                  return (
                    <div key={key || index} {...itemProps}>
                      <span className="text-gray-700">{suggestion.description}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </PlacesAutocomplete>
      </div>

      {loading && <div className="text-center py-4">Loading weather and events data...</div>}
      {error && <div className="text-center text-red-500 py-4">Error: {error}</div>}
      
      {weather && <Weather weather={weather} />}
      {events && <YelpEvents events={events} weather={weather} />}
    </div>
  );
}

export default LocationSearch;
