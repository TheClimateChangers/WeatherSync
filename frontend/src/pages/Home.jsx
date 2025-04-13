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

      {/* Explore Section */}
      <section className="explore-section">
        <h2>Explore</h2>
        <div className="explore-cards">
          <div className="explore-card">
            <div className="card-image card-paris"></div>
            <div className="card-info">
              <h4>Paris, France</h4>
              <p>5 Days · Sunny</p>
            </div>
          </div>

          <div className="explore-card">
            <div className="card-image card-tokyo"></div>
            <div className="card-info">
              <h4>Tokyo, Japan</h4>
              <p>7 Days · Cloudy</p>
            </div>
          </div>

          <div className="explore-card">
            <div className="card-image card-rome"></div>
            <div className="card-info">
              <h4>Rome, Italy</h4>
              <p>6 Days · Sunny</p>
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

