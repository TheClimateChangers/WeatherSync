// NavBar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/NavBar.css";

const NavBar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="nav-links">
                <Link to="/home" className="nav-link">Home</Link>
                <Link to="/notes" className="nav-link">Notes</Link>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link">Register</Link>
            </div>
            <button onClick={handleLogout} className="logout-button">
                Logout
            </button>
        </nav>
    );
};

export default NavBar;
