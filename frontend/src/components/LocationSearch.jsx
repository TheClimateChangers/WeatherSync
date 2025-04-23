import React, { useState } from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';
import '../styles/Home.css';

function LocationSearch({ onLocationChange }) {
  const [location, setLocation] = useState('');

  const handleSelect = address => {
    setLocation(address);
    if (onLocationChange) {
      onLocationChange(address);
    }
  };

  const handleChange = address => {
    setLocation(address);
    if (onLocationChange) {
      onLocationChange(address);
    }
  };

  return (
    <div>
      <div className="pb-5">
            <PlacesAutocomplete
              value={location}
              onChange={handleChange}
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
    </div>
  );
}

export default LocationSearch;
