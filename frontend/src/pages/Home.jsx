import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  return (
    <div className="home-container">
      {/* Banner Section */}
      <div className="banner">
        <div className="banner-dim"></div>
        <div className="banner-overlay">
          <h1>Plan your next Trip</h1>
          <p>Helping millions find their perfect destination.</p>
          <Link to="/plan">
            <button className="plan-trip-button">Build Trip</button>
          </Link>
        </div>
      </div>

      {/* Mission Highlight Section */}
      <section className="explore-section">
        <h2>How We Help You Travel Smarter</h2>
        <div className="explore-cards">
          <div className="explore-card">
            <div className="card-image card-planning"></div>
            <div className="card-info">
              <h4>Smart Planning</h4>
              <p>We craft itineraries tailored to your travel goals and time.</p>
            </div>
          </div>

          <div className="explore-card">
            <div className="card-image card-weather"></div>
            <div className="card-info">
              <h4>Weather-Synced</h4>
              <p>Plan around live forecasts to enjoy the best of each day.</p>
            </div>
          </div>

          <div className="explore-card">
            <div className="card-image card-tailored"></div>
            <div className="card-info">
              <h4>Tailored to You</h4>
              <p>Find adventures based on what you actually care about.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="mission-section">
        <div className="mission-text">
          <h3>Our Journey, Your Adventure</h3>
          <p>
            At TripSync, we’re redefining travel planning. Our mission is to simplify
            your journey by building smart, personalized trip itineraries that sync
            with real-time weather and your unique interests. Whether you're chasing
            sunshine or exploring rainy-day gems, we help you discover the best
            activities for any destination—effortlessly.
          </p>
        </div>
        <div className="mission-image"></div>
      </section>
    </div>
  );
};

export default Home;


