import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/SideBar.css";

const navItems = [
  { name: "Home", path: "/home" },
  { name: "My Trips", path: "/trips" },
  { name: "Search", path: "/search" },
  { name: "Profile", path: "/profile" },
];

const SideBar = () => {
  const location = useLocation();

  return (
    <div className="sidebar">
      <div>
        <h2 className="sidebar-title">TripSync</h2>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`sidebar-link ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <Link to="/create" className="create-trip-btn">
        + Create Trip
      </Link>
    </div>
  );
};

export default SideBar;
