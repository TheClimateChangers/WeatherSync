import React from "react";
import { Link } from "react-router-dom";
//import "../styles/Home.css";

const Home = () => {
  return (
    <div className="home-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo-container">
          <h1 className="title">TripSync</h1>
        </div>
      </header>

      {/* Banner Section */}
      <div className="banner">
        <div className="banner-overlay">
          <h1>Plan Your Next Adventure</h1>
          <Link to="/plan">
            <button className="plan-trip-button">Plan Trip</button>
          </Link>
        </div>
      </div>

      {/* Messages Section */}

      {/* Map Section */}

      {/* Styles */}
      <style jsx>{`
        .home-container {
          text-align: center;
        }
        
        .banner {
          position: relative;
          background: url('/images/banner.jpg') no-repeat center center/cover;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .banner-overlay {
          background: rgba(0, 0, 0, 0.5);
          padding: 20px;
          border-radius: 10px;
          color: white;
          text-align: center;
        }

        .plan-trip-button {
          background-color: #ff7f50;
          border: none;
          padding: 12px 24px;
          font-size: 18px;
          color: white;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.3s;
        }

        .plan-trip-button:hover {
          background-color: #ff5722;
        }
      `}</style>
    </div>
  );
};

export default Home;