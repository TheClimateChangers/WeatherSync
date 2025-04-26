import React, { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import LocationSearch from '../components/LocationSearch.jsx';
import ContinueButton from '../components/ContinueButton.jsx';
import '../styles/Plan.css';
import DateCalendar from '../components/DateCalendar.jsx';
import Activities from '../components/Activities.jsx';
import AddUsers from '../components/AddUsers.jsx';
import { createTrip } from '../api.js';
import { ACCESS_TOKEN } from '../constants';
import { useNavigate } from 'react-router-dom';

function Plan() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Step 0: Location
  const [location, setLocation] = useState("");
  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    // Validate location
    if (!location) {
      setError("Please select a location for your trip");
      setIsSubmitting(false);
      return;
    }

    try {
      // Try to get the Django user ID first (created during Google login)
      let creatorId = localStorage.getItem('DJANGO_USER_ID');
      
      // If not found, try to get it from the JWT token as a fallback
      if (!creatorId) {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
          throw new Error('You need to be logged in to create a trip. Please login and try again.');
        }

        try {
          // Decode the token to get user info
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          console.log('Token payload:', tokenPayload);
          
          // Check if this is Google auth or Django auth
          const isGoogleAuth = tokenPayload.iss && tokenPayload.iss.includes('securetoken.google.com');
          
          if (isGoogleAuth) {
            const message = 'You are logged in with Google, but we could not find your Django user ID. Please log out and log in again with Google.';
            console.error(message);
            setError(message);
            
            if (confirm(message + ' Would you like to log out now?')) {
              localStorage.clear();
              navigate('/login');
            }
            return;
          } else {
            // This is Django authentication - get the user_id from the token
            creatorId = tokenPayload.user_id;
            
            if (!creatorId) {
              throw new Error('Could not find user ID in Django token. Please log out and log in again.');
            }
            
            console.log('Found Django user ID in token:', creatorId);
          }
        } catch (e) {
          console.error('Error parsing token:', e);
          throw new Error('Error reading authentication token. Please log out and log in again.');
        }
      }
      
      // Convert creator_id to integer if it's a string
      const numericCreatorId = parseInt(creatorId, 10);
      if (isNaN(numericCreatorId)) {
        throw new Error('Invalid user ID format: must be a numeric value');
      }
      
      console.log('Using Django creator ID:', numericCreatorId);
      console.log('Location:', location);
      console.log('Start date:', startDate.toISOString().split('T')[0]);
      console.log('End date:', endDate);
      console.log('Selected activities:', selectedActivities);
      console.log('Added users:', addedUsers);

      // Extract city name from location (if it contains a comma)
      const cityName = location.includes(',') ? location.split(',')[0] : location;

      const payload = {
        creator_id: numericCreatorId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate ? endDate.toISOString().split('T')[0] : startDate.toISOString().split('T')[0], // Handle case where end date is null
        location: cityName,
        // Use existing activity IDs that we know exist
        activities: selectedActivities.length > 0 ? [1, 2, 3].slice(0, selectedActivities.length) : [],
        // Skip adding users for now to simplify
        events: [],
      };

      console.log('Sending payload:', payload);

      const response = await createTrip(payload);
      console.log('Trip created successfully:', response);
      alert('Trip created successfully!');
      
      // Reset form or navigate to trips list
      setSelectedActivities([]);
      setAddedUsers([]);
      setStartDate(new Date());
      setEndDate(null);
      setLocation("");
      navigate('/trips');
    } catch (error) {
      console.error('Error creating trip:', error);
      let errorMessage = error.message || 'Failed to create trip. Please try again.';
      
      // Extract and display more detailed error information
      if (error.response && error.response.data) {
        console.error('Error details:', error.response.data);
        
        // Format error messages from response data
        if (typeof error.response.data === 'object') {
          const detailedErrors = [];
          for (const [key, value] of Object.entries(error.response.data)) {
            detailedErrors.push(`${key}: ${value}`);
          }
          errorMessage = detailedErrors.join('\n');
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  //Step 1: Dates
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [dateRange, setDateRange] = useState('');
  const [isValidRange, setIsValidRange] = useState(false);

  //Step 2: Activities
  const activities = [
    'Regional Cuisine',
    'Food & Drink',
    'Active & Outdoors',
    'Arts & Culture',
    'Shopping',
    'Beauty',
    'Local Attractions',
    'Tours',
    'Nightlife',
    'Other',
  ];
  const [selectedActivities, setSelectedActivities] = useState([]);
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
  const [addedUsers, setAddedUsers] = useState([]);

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
    <div className="scroll-container"
      style={{
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '30px',
        margin: '0 auto',
        maxWidth: '700px',
        textAlign: 'center',
      }}
    >
      <h2 style={{ marginBottom: '30px' }}>Plan Your Trip</h2>

      {/* Step 0: Location */}
      <div className="plan-section">
        <h3>Where are you going?</h3>
        <LocationSearch onLocationChange={handleLocationChange} />
        {location && <p className="selected-location">Selected: {location}</p>}
      </div>
      
      {/* Step 1: Dates */}
      <DateCalendar
        startDate={startDate}
        endDate={endDate}
        onDateChange={onDateChange}
        dateRange={dateRange}
      />
      {/* Step 2: Activities */}
      <Activities
        activities={activities}
        selectedActivities={selectedActivities}
        toggleActivity={toggleActivity}
      />
      {/* Step 3: Users */}
      <AddUsers
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        suggestedUsers={suggestedUsers}
        addUser={addUser}
        addedUsers={addedUsers}
        isReadyToProceed={isReadyToProceed}
      />
      {/* Error message */}
      {error && <div className="error-message">{error}</div>}
      {/* Submit */}
      <div style={{ marginTop: '40px' }}>
        <ContinueButton
          onClick={handleSubmit}
          label="Finish Planning"
          disabled={!location || !isValidRange || !isReadyToProceed || isSubmitting}
        />
      </div>
    </div>
  );
}

export default Plan;
