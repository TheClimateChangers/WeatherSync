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
  // const [weather, setWeather] = useState(null);
  // const [events, setEvents] = useState(null);
  const [location, setLocation] = useState('');
  // const [error, setError] = useState(null);
  // const [loading, setLoading] = useState(false);

  // const getWeather = city => {
  //   setLoading(true);
  //   setError(null);

  //   // Fetch weather data for the selected city
  //   api
  //     .get(`/api/weather/?location=${encodeURIComponent(city)}`)
  //     .then(res => res.data)
  //     .then(data => {
  //       if (data && data.temperature !== null) {
  //         setWeather(data);
  //       } else {
  //         throw new Error('Failed to get valid weather data');
  //       }
  //     })
  //     .catch(err => {
  //       const errorMessage =
  //         err.response?.data?.error ||
  //         err.message ||
  //         'Failed to fetch weather data';
  //       setError(errorMessage);
  //       setWeather(null);
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // };

  // const getYelpEvents = city => {
  //   setLoading(true);
  //   setError(null);

  //   api
  //     .get(`/api/yelp-events/?location=${encodeURIComponent(city)}`)
  //     .then(res => res.data)
  //     .then(data => {
  //       setEvents(data);
  //     })
  //     .catch(err => {
  //       const errorMessage =
  //         err.response?.data?.error ||
  //         err.message ||
  //         'Failed to fetch Yelp events';
  //       setError(errorMessage);
  //       setEvents(null);
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // };

  const handleSelect = address => {
    setLocation(address);
    // getWeather(address);
    // getYelpEvents(address);
  };

  return (
    <div className="pb-5">
      <div className="weather-container">
        {/* <form
          onSubmit={e => {
            e.preventDefault();
            if (location.trim()) {
              getWeather(location.trim());
              getYelpEvents(location.trim());
            }
          }}
          className="weather-form"
        > */}
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
                  placeholder: 'Enter Travel Destination',
                  className:
                    'w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400',
                })}
              />
              <div>
                {placesLoading && (
                  <div className="px-4 py-2 text-gray-500"> Loading...</div>
                )}
                {suggestions.map((suggestion, index) => {
                  const isActive = suggestion.active;
                  const className = isActive
                    ? 'bg-orange-100 text-white rounded-lg'
                    : 'hover:bg-orange-500 rounded-lg';
                  const { key, ...itemProps } = getSuggestionItemProps(
                    suggestion,
                    {
                      className: `px-4 py-2 cursor-pointer ${className}`,
                    }
                  );
                  return (
                    <div key={key || index} {...itemProps}>
                      <span className="text-gray-700">
                        {suggestion.description}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </PlacesAutocomplete>
        {/* </form> */}
        {/* {error && <div className="error-message">{error}</div>}
        {weather && <Weather data={weather} />}
        {events && <YelpEvents events={events} />} */}
      </div>
    </div>
  );
}

export default LocationSearch;
