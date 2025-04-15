import React, { useState } from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';
import api from '../api';
import Weather from './Weather';
import YelpEvents from './YelpEvents';
import '../styles/Home.css';
import '../styles/Weather.css';
import { LoadScript } from '@react-google-maps/api';

const GOOGLE_MAP_LIBRARIES = ['places'];

function LocationSearch() {
  const [weather, setWeather] = useState(null);
  const [events, setEvents] = useState(null);
  const [location, setLocation] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getWeather = city => {
    setLoading(true);
    setError(null);

    // Fetch weather data for the selected city
    api
      .get(`/api/weather/?location=${encodeURIComponent(city)}`)
      .then(res => res.data)
      .then(data => {
        if (data && data.temperature !== null) {
          setWeather(data);
        } else {
          throw new Error('Failed to get valid weather data');
        }
      })
      .catch(err => {
        const errorMessage =
          err.response?.data?.error ||
          err.message ||
          'Failed to fetch weather data';
        setError(errorMessage);
        setWeather(null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getYelpEvents = city => {
    setLoading(true);
    setError(null);

    api
      .get(`/api/yelp-events/?location=${encodeURIComponent(city)}`)
      .then(res => res.data)
      .then(data => {
        setEvents(data);
      })
      .catch(err => {
        const errorMessage =
          err.response?.data?.error ||
          err.message ||
          'Failed to fetch Yelp events';
        setError(errorMessage);
        setEvents(null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSelect = address => {
    setLocation(address);
    getWeather(address);
    getYelpEvents(address);
  };

  return (
    <div>
      <div className="weather-container">
        <form
          onSubmit={e => {
            e.preventDefault();
            if (location.trim()) {
              getWeather(location.trim());
              getYelpEvents(location.trim());
            }
          }}
          className="weather-form"
        >
          {/* Load Google Maps API for Places Autocomplete */}
          <LoadScript
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            libraries={GOOGLE_MAP_LIBRARIES}
          >
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
                      className: 'location-search-input',
                    })}
                  />
                  <div className="autocomplete-dropdown-container">
                    {placesLoading && <div>Loading...</div>}
                    {suggestions.map((suggestion, index) => {
                      const className = suggestion.active
                        ? 'suggestion-item--active'
                        : 'suggestion-item';
                      const { key, ...itemProps } = getSuggestionItemProps(
                        suggestion,
                        {
                          className,
                        }
                      );
                      return (
                        <div key={key || index} {...itemProps}>
                          <span>{suggestion.description}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </PlacesAutocomplete>
            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Search'}
            </button>
          </LoadScript>
        </form>
        {error && <div className="error-message">{error}</div>}
        {weather && <Weather weather={weather} />}
        {events && <YelpEvents events={events} />}
      </div>
    </div>
  );
}

export default LocationSearch;
