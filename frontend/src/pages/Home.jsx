import React from 'react'
import { useState, useEffect } from "react";
import api from "../api";
import Weather from "../components/Weather"
import "../styles/Home.css"
import "../styles/Weather.css"

function Home() {
    const [weather, setWeather] = useState(null);
    const [location, setLocation] = useState("");

    const getWeather = (city) => {
        api
            .get(`/api/weather/?location=${city}`)
            .then((res) => res.data)
            .then((data) => {
                if (data.length > 0) {
                    setWeather(data[0]);
                } else {
                    // If no cached data, fetch new data
                    api
                        .post("/api/weather/", { location: city })
                        .then((res) => res.data)
                        .then((newData) => setWeather(newData))
                        .catch((err) => alert(err));
                }
            })
            .catch((err) => alert(err));
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
                    <button type="submit">Get Weather</button>
                </form>

                {weather && <Weather weather={weather} />}
            </div>
        </div>
    );
}

export default Home;