import React, { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import LocationSearch from '../components/LocationSearch.jsx';
import ContinueButton from '../components/ContinueButton.jsx';
import '../styles/Plan.css';
import DateCalendar from '../components/DateCalendar.jsx';
import Activities from '../components/Activities.jsx';
import AddUsers from '../components/AddUsers.jsx';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, TextField, Paper, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addDays } from 'date-fns';
import api from '../api';

function Plan() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(addDays(new Date(), 1));
  const [endDate, setEndDate] = useState(addDays(new Date(), 2));
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [addedUsers, setAddedUsers] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    try {
      const payload = {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        activity_ids: selectedActivities.map(activity => activity.id),
        invited_user_ids: addedUsers.map(user => user.id),
      };

      const response = await api.post('/trips/', payload);
      
      if (response.status === 201) {
        navigate('/my-trips');
      } else {
        setError('Failed to create trip. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while creating the trip.');
    }
  };

  //Step 1: Dates
  const [dateRange, setDateRange] = useState('');
  const [isValidRange, setIsValidRange] = useState(false);

  //Step 2: Activities
  const activities = [
    'Music',
    'Visual Arts',
    'Performing Arts',
    'Film',
    'Lectures & books',
    'Fashion',
    'Food & Drink',
    'Festivals & Fairs',
    'Charities',
    'Sports & Active Life',
    'Nightlife',
    'Kids & Family',
    'Other',
  ];
  const [isReadyToProceed, setIsReadyToProceed] = useState(false);

  //Step 3: Users
  const followedUsers = [
    'mark_smith',
    'julian_lee',
    'michael_chen',
    'giselle_ruiz',
    'nate_diaz',
    'jackie_chan',
    'marcus_aurelius',
  ];
  const [searchInput, setSearchInput] = useState('');
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  //Date change
  const onDateChange = ([start, end]) => {
    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
    if (startDate && endDate) {
      setDateRange(`${startDate.toDateString()} - ${endDate.toDateString()}`);
      setIsValidRange(true);
    } else {
      setDateRange(startDate ? `Start: ${startDate.toDateString()}` : '');
      setIsValidRange(false);
    }
  }, [startDate, endDate]);

  //Activity toggle
  const toggleActivity = name => {
    setSelectedActivities(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  useEffect(() => {
    setIsReadyToProceed(selectedActivities.length > 0);
  }, [selectedActivities]);

  //User search
  useEffect(() => {
    const filtered = searchInput.trim()
      ? followedUsers.filter(user =>
          user.toLowerCase().includes(searchInput.toLowerCase())
        )
      : [];
    setSuggestedUsers(filtered);
  }, [searchInput]);

  const addUser = username => {
    if (!addedUsers.includes(username)) {
      setAddedUsers([...addedUsers, username]);
    }
    setSearchInput('');
    setSuggestedUsers([]);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Plan Your Trip
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Trip Dates
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              minDate={addDays(new Date(), 1)}
              renderInput={(params) => <TextField {...params} />}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              minDate={startDate}
              renderInput={(params) => <TextField {...params} />}
            />
          </Box>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selected Activities
          </Typography>
          <List>
            {selectedActivities.map((activity) => (
              <ListItem
                key={activity.id}
                secondaryAction={
                  <IconButton edge="end" onClick={() => setSelectedActivities(selectedActivities.filter(a => a.id !== activity.id))}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={activity.name}
                  secondary={`Rating: ${activity.rating} | ${activity.categories.join(', ')}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Invited Users
          </Typography>
          <List>
            {addedUsers.map((user) => (
              <ListItem
                key={user.id}
                secondaryAction={
                  <IconButton edge="end" onClick={() => setAddedUsers(addedUsers.filter(u => u.id !== user.id))}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={user.username} />
              </ListItem>
            ))}
          </List>
        </Paper>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={selectedActivities.length === 0}
        >
          Finish Planning
        </Button>
      </Box>
    </LocalizationProvider>
  );
}

export default Plan;
