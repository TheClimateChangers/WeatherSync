import React from 'react';
import TripsList from '../components/TripsList.jsx';
import '../styles/TripsList.css';

function Trips() {
  return (
    <div className="my-trips-page">
      <h1>My Trips</h1>
      <TripsList />
    </div>
  );
}

export default Trips; 