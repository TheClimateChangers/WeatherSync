import React, { useState, useEffect } from 'react';
import { getTrips } from '../api.js';
import { useNavigate } from 'react-router-dom';

function TripsList() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await getTrips();
        setTrips(data);
      } catch (error) {
        console.error('Error fetching trips:', error);
        setError('Failed to load trips');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  if (loading) return <div className="loading">Loading trips...</div>;
  if (error) return <div className="error">{error}</div>;
  if (trips.length === 0) return <div className="no-trips">No trips found</div>;

  return (
    <div className="trips-container">
      <div className="trips-grid">
        {trips.map((trip) => (
          <div className="trip-card" key={trip.id} onClick={() => navigate(`/trips/${trip.id}`)}>
            <div className="trip-card-content">
              <h3>Trip to {trip.location || "Unknown"}</h3>
              <p className="trip-creator">By: {trip.creator.username}</p>
              <p className="trip-dates">
                {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
              </p>
              <div className="trip-stats">
                <p>Activities: {trip.activities.length}</p>
                <p>Invited Users: {trip.invited_users.length}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TripsList; 