import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home-container">
      {/* Navbar */}
      <header className="navbar">
        <h1 className="title">TripSync</h1>
      </header>

      {/* Banner Section */}
      <div className="banner">
        <div className="banner-overlay">
          <h2>Your next adventure starts here.</h2>
          <Link to="/plan">
            <button className="build-trip-button">Build Trip</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
