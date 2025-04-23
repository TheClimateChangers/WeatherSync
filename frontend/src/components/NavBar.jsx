// NavBar.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import "../styles/NavBar.css";

const NavBar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext);

  const handleLogout = () => {
    // Clear all storage including the DJANGO_USER_ID
    localStorage.clear();
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate("/")}>
        <div className="logo" />
        <span className="company-name">TripSync</span>
      </div>

      <div className="nav-links">
        {!isAuthenticated ? (
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