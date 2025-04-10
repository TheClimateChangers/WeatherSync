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
    </div>
  );
};

export default Home;
