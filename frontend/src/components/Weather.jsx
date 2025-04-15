import React from 'react';

function Weather({ weather }) {
    if (!weather) return null;

    console.log('Full weather data:', JSON.stringify(weather, null, 2));

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="weather-container">
            {/* Current Weather */}
            <div className="current-weather">
                <h3>{weather.current.location}</h3>
                <div className="weather-details">
                    <div className="temperature">
                        <span className="temp-value">{weather.current.temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="weather-info">
                        <p>{weather.current.weather_conditions?.description || 'No description available'}</p>
                        <p>Rain chance: {(weather.current.rain_chance * 100).toFixed(0)}%</p>
                        <p>Humidity: {weather.current.weather_conditions?.humidity}%</p>
                        <p>Wind speed: {weather.current.weather_conditions?.wind_speed} m/s</p>
                    </div>
                    {weather.current.weather_conditions?.icon && (
                        <img 
                            src={`http://openweathermap.org/img/wn/${weather.current.weather_conditions.icon}@2x.png`} 
                            alt={weather.current.weather_conditions.main || 'Weather icon'}
                        />
                    )}
                </div>
            </div>

            {/* 7-Day Forecast */}
            <div className="forecast-container">
                <h3>7-Day Forecast</h3>
                <div className="forecast-grid">
                    {weather.forecast.map((day, index) => (
                        <div key={index} className="forecast-day">
                            <h4>{formatDate(day.date)}</h4>
                            <div className="forecast-temp">
                                <span className="max-temp">{day.temperature.max.toFixed(1)}°</span>
                                <span className="min-temp">{day.temperature.min.toFixed(1)}°</span>
                            </div>
                            <div className="forecast-conditions">
                                <img 
                                    src={`http://openweathermap.org/img/wn/${day.weather_conditions.icon}@2x.png`} 
                                    alt={day.weather_conditions.main}
                                />
                                <p>{day.weather_conditions.description}</p>
                            </div>
                            <div className="forecast-details">
                                <p>Rain: {(day.rain_chance * 100).toFixed(0)}%</p>
                                <p>Humidity: {day.humidity.toFixed(0)}%</p>
                                <p>Wind: {day.wind_speed.toFixed(1)} m/s</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Weather; 