// NavBar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/NavBar.css";

const NavBar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token"); 
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate("/")}>
        <div className="logo" />
        <span className="company-name">TripSync</span>
      </div>

      <div className="nav-links">
        {!isLoggedIn ? (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        ) : (
          <button onClick={handleLogout} className="logout-button">Logout</button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
