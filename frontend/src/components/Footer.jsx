import React from 'react';
import '../styles/Footer.css'; 

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">© {new Date().getFullYear()} TripSync. All rights reserved.</p>
        <nav className="footer-links">
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
