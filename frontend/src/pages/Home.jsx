import React from 'react'
import { useState, useEffect } from "react";
import api from "../api";
import Weather from "../components/Weather"
import "../styles/Home.css"
import "../styles/Weather.css"

function Home() {
    const [weather, setWeather] = useState(null);
    const [location, setLocation] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const getWeather = (city) => {
        setLoading(true);
        setError(null);
        
        api
            .get(`/api/weather/?location=${city}`)
            .then((res) => {
                console.log('API Response:', res.data);  // Debug log
                return res.data;
            })
            .then((data) => {
                console.log('Processed data:', data);  // Debug log
                if (data.length > 0) {
                    setWeather(data[0]);
                } else {
                    // If no cached data, fetch new data
                    return api.post("/api/weather/", { location: city })
                        .then((res) => {
                            console.log('New weather data:', res.data);  // Debug log
                            return res.data;
                        })
                        .then((newData) => setWeather(newData));
                }
            })
            .catch((err) => {
                console.error('Error fetching weather:', err);  // Debug log
                const errorMessage = err.response?.data?.error || "Failed to fetch weather data";
                setError(errorMessage);
                setWeather(null);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (location.trim()) {
            getWeather(location.trim());
        }
    };

    return (
        <div>
            <div style={{ backgroundColor: '#3498db', color: 'white', padding: '20px', marginBottom: '20px', textAlign: 'center', borderRadius: '5px' }}>
                <h1>WeatherSync</h1>
                <p>Check the weather in your city</p>
            </div>
            
            <div className="weather-container">
                <form onSubmit={handleSubmit} className="weather-form">
                    <input
                        type="text"
                        placeholder="Enter city name"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Loading...' : 'Get Weather'}
                    </button>
                </form>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {weather && <Weather weather={weather} />}
            </div>
        </div>
    );
}

export default Home;