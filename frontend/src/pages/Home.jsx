import React, { useState } from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';
import api from '../api';
import Weather from '../components/Weather';
import YelpEvents from '../components/YelpEvents';
import '../styles/Home.css';
import '../styles/Weather.css';
import { LoadScript } from '@react-google-maps/api';

const GOOGLE_MAP_LIBRARIES = ['places'];

function Home() {
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
      .get(`/api/weather/?location=${city}`)
      .then(res => res.data)
      .then(data => {
        if (data && data.temperature !== null) {
          setWeather(data);
        } else {
          return api
            .post('/api/weather/', { location: city })
            .then(res => res.data)
            .then(newData => {
              if (newData && newData.temperature !== null) {
                setWeather(newData);
              } else {
                throw new Error('Failed to get valid weather data');
              }
            });
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
    api
      .get(`/api/yelp-activities/?location=${city}`)
      .then(res => res.data)
      .then(data => {
        setEvents(data);
      })
      .catch(err => {
        console.error('Failed to fetch Yelp events:', err);
        setEvents(null);
      });
  };

  const handleSelect = address => {
    setLocation(address); // Update the location
    getWeather(address); // Fetch weather data based on the selected location
    getYelpEvents(address); // Fetch Yelp events for the selected location
  };

  return (
    <div>
      <div
        style={{
          backgroundColor: '#3498db',
          color: 'white',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'center',
          borderRadius: '5px',
        }}
      >
        <h1>WeatherSync</h1>
        <p>Check the weather and local activities in your city</p>
      </div>

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
                loading,
              }) => (
                <div>
                  <input
                    {...getInputProps({
                      placeholder: 'Enter city name',
                      className: 'location-input',
                    })}
                    required
                  />
                  <div className="autocomplete-dropdown">
                    {loading && <div>Loading...</div>}
                    {suggestions.map(suggestion => {
                      const className = suggestion.active
                        ? 'suggestion-item--active'
                        : 'suggestion-item';

                      // Separate key before spreading
                      const itemProps = getSuggestionItemProps(suggestion, {
                        className,
                      });
                      const { key: _key, ...rest } = itemProps;

                      return (
                        <div key={suggestion.placeId} {...rest}>
                          <span>{suggestion.description}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </PlacesAutocomplete>
          </LoadScript>

          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Get Weather & Activities'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
        {weather && <Weather weather={weather} />}
        {events && <YelpEvents events={events} />}
      </div>
    </div>
  );
}

export default Home;
