import React from 'react';

function Weather({ weather }) {
    if (!weather) return null;

    return (
        <div className="weather-card">
            <h3>{weather.location}</h3>
            <div className="weather-details">
                <div className="temperature">
                    <span className="temp-value">{weather.temperature}°C</span>
                </div>
                <div className="weather-info">
                    <p>{weather.weather_conditions.description}</p>
                    <p>Rain chance: {weather.rain_chance}%</p>
                </div>
                <img 
                    src={`http://openweathermap.org/img/wn/${weather.weather_conditions.icon}@2x.png`} 
                    alt={weather.weather_conditions.main}
                />
            </div>
        </div>
    );
}

export default Weather; 