import React, { useState, useEffect } from 'react';
import { getTrips } from '../api.js';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';

function TripsList() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <Typography>Loading trips...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (trips.length === 0) return <Typography>No trips found</Typography>;

  return (
    <div className="trips-container">
      <h2>My Trips</h2>
      <Grid container spacing={2}>
        {trips.map((trip) => (
          <Grid item xs={12} sm={6} md={4} key={trip.id}>
            <Card className="trip-card">
              <CardContent>
                <Typography variant="h6" component="div">
                  {trip.creator.username}'s Trip
                </Typography>
                <Typography color="text.secondary">
                  {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Activities: {trip.activities.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Invited Users: {trip.invited_users.length}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default TripsList; 