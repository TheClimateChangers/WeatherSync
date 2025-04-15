import React from 'react';

function Weather({ weather }) {
    if (!weather) return null;

    console.log('Full weather data:', JSON.stringify(weather, null, 2));

    // Format temperature to one decimal place
    const formattedTemp = weather.temperature ? weather.temperature.toFixed(1) : 'N/A';
    
    // Format rain amount - show in mm
    const rainAmount = weather.rain_chance ? weather.rain_chance.toFixed(1) : '0';

    return (
        <div className="weather-card">
            <h3>{weather.location}</h3>
            <div className="weather-details">
                <div className="temperature">
                    <span className="temp-value">{formattedTemp}°C</span>
                </div>
                <div className="weather-info">
                    <p>{weather.weather_conditions?.description || 'No description available'}</p>
                    <p>Rain amount: {rainAmount} mm</p>
                    <p>Humidity: {weather.weather_conditions?.humidity || 'N/A'}%</p>
                    <p>Wind speed: {weather.weather_conditions?.wind_speed || 'N/A'} m/s</p>
                </div>
                {weather.weather_conditions?.icon && (
                    <img 
                        src={`http://openweathermap.org/img/wn/${weather.weather_conditions.icon}@2x.png`} 
                        alt={weather.weather_conditions.main || 'Weather icon'}
                    />
                )}
            </div>
        </div>
    );
}

export default Weather; 