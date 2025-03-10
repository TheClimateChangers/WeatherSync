import React from "react";
import { Link } from "react-router-dom";
import TripMap from "../components/TripMap";

const Home = () => {
    return (
      <div>
        <h1>WeatherSync Team Messages:</h1>
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
        <h2>TripSync Map</h2>
        <TripMap />
      </div>
    );
  };

export default Home;