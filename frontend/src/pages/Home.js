import React from "react";
import { Link } from "react-router-dom";
import TripMap from "../components/TripMap";
//import logo from "../assets/logo.png"; // Make sure to add your logo inside /assets

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
      <h2>WeatherSync Team Messages:</h2>
      <nav>
        <ul>
          <li><Link to="/hello">View Hello Message</Link></li>
          <li><Link to="/mark">View Mark's Message</Link></li>
          <li><Link to="/julian">View Julian's Message</Link></li>
          <li><Link to="/michael">View Michael's Message</Link></li>
          <li><Link to="/giselle">View Giselle's Message</Link></li>
          <li><Link to="/nate">View Nate's Message</Link></li>
        </ul>
      </nav>

      {/* Map Section */}
      <h2>TripSync Map</h2>
      <TripMap />

      {/* Styles */}
      <style jsx>{`
        .home-container {
          text-align: center;
        }

        /* Navbar */
        .navbar {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 15px;
          background-color: #333;
          color: white;
          box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        }

        .logo-container {
          display: flex;
          align-items: center;
        }

        .logo {
          width: 50px;
          height: auto;
          margin-right: 10px;
        }

        .title {
          font-size: 24px;
          font-weight: bold;
        }

        /* Banner */
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
