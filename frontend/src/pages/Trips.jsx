import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, Paper, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import { format } from 'date-fns';
import api from '../api';

function TripsPage() {
  const [view, setView] = useState("full");
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await api.get('/trips/');
      setTrips(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch trips. Please try again later.');
      setLoading(false);
    }
  };

  const handleCreateNewTrip = () => {
    navigate('/plan');
  };

  if (loading) {
    return (
      <Box sx={{ p: 6 }}>
        <Typography>Loading trips...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 6 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Trips</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView("full")}
            className={`px-4 py-2 rounded-l ${
              view === "full"
                ? "bg-orange-400 rounded-l-lg text-white"
                : "bg-gray-200 hover:bg-orange-300"
            }`}
          >
            Full View
          </button>
          <button
            onClick={() => setView("grid")}
            className={`px-4 py-2 rounded-r ${
              view === "grid"
                ? "bg-orange-400 rounded-r-lg text-white"
                : "bg-gray-200 hover:bg-orange-300"
            }`}
          >
            Grid View
          </button>
          <button
            onClick={handleCreateNewTrip}
            className="ml-4 px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-500"
          >
            Create New Trip
          </button>
        </div>
      </div>

      {trips.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No trips found
          </Typography>
          <Typography color="text.secondary">
            Start planning your next adventure by creating a new trip!
          </Typography>
        </Paper>
      ) : view === "full" ? (
        <div className="flex flex-col gap-6 overflow-y-scroll max-h-[80vh] px-2">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="w-full h-[400px] bg-gray-800 rounded-lg text-white hover:scale-[1.02] transition-transform p-6 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-semibold">
                    {format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
                  </h3>
                  <span className={`px-2 py-1 rounded ${
                    trip.is_active ? 'bg-green-500' : 'bg-gray-500'
                  }`}>
                    {trip.is_active ? 'Active' : 'Completed'}
                  </span>
                </div>
                <div className="mb-4">
                  <p className="text-sm mb-2">Activities: {trip.activities.length}</p>
                  <p className="text-sm">Invited Users: {trip.invited_users.length}</p>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-2">Activities:</h4>
                  <ul className="list-disc ml-5">
                    {trip.activities.map((activity) => (
                      <li key={activity.id} className="mb-1">
                        {activity.name} ({activity.rating} ⭐)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm">Created by: {trip.creator.username}</p>
                <p className="text-sm">Trip ID: {trip.id}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-gray-800 p-4 rounded-lg text-white shadow hover:scale-[1.02] transition-transform"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-semibold">
                  {format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d')}
                </h4>
                <span className={`px-2 py-1 rounded text-xs ${
                  trip.is_active ? 'bg-green-500' : 'bg-gray-500'
                }`}>
                  {trip.is_active ? 'Active' : 'Completed'}
                </span>
              </div>
              <p className="text-sm mb-2">Activities: {trip.activities.length}</p>
              <p className="text-sm mb-2">Users: {trip.invited_users.length}</p>
              <ul className="text-sm mt-2 list-disc ml-4">
                {trip.activities.slice(0, 3).map((activity) => (
                  <li key={activity.id}>{activity.name}</li>
                ))}
                {trip.activities.length > 3 && (
                  <li className="text-gray-400">+{trip.activities.length - 3} more</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TripsPage;
