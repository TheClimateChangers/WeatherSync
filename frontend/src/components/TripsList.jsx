import React, { useState, useEffect } from 'react';
import { getTrips } from '../api.js';
import { useNavigate } from 'react-router-dom';
import DeleteTripButton from './DeleteTripButton.jsx';

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${month}/${day}`;
}

function TripsList() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('DJANGO_USER_ID');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await getTrips();
        // Only include trips where the user is the creator or is in invited_users
        const filtered = data.filter(trip => {
          const isCreator = trip.creator?.id?.toString() === currentUserId;
          const isInvited = trip.invited_users?.some(user => user.id?.toString() === currentUserId);
          return isCreator || isInvited;
        });
        setTrips(filtered);
        //setTrips(data);
      } catch (error) {
        console.error('Error fetching trips:', error);
        setError('Failed to load trips');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [currentUserId]);

  if (loading) return <div className="loading">Loading trips...</div>;
  if (error) return <div className="error">{error}</div>;
  if (trips.length === 0) return <div className="no-trips">No trips found</div>;

  return (
    <div className="trips-container">
      <div className="trips-grid"> 
        {trips.map((trip) => (
          <div className="trip-card" key={trip.id} onClick={() => navigate(`/trips/${trip.id}`)}>
            <div className="flex justify-end">
            <DeleteTripButton
  tripId={trip.id}
  onDeleteSuccess={(deletedId) => {
    setTrips((prevTrips) => prevTrips.filter((t) => t.id !== deletedId));
  }}
/>
              </div>
            <div className="trip-card-content">
              
              <h3>Trip to {trip.location || "Unknown"}</h3>
              <p className="trip-creator">By: {trip.creator.username}</p>
              <p className="trip-dates">
                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
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
 