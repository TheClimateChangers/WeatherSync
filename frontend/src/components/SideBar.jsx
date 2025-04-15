import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/SideBar.css";

const navItems = [
  { name: "Home", path: "/home" },
  { name: "My Trips", path: "/trips" },
  // { name: "Search", path: "/search" },
  { name: "Profile", path: "/profile" },
];

const SideBar = () => {
  const location = useLocation();

  return (
    <div className="sidebar">
      <div>
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
        
      <Link to="/plan" className="create-trip-btn">
        + Build
      </Link>
      </div>

    </div>
  );
};

export default SideBar;
