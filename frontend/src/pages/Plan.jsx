import React, { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import LocationSearch from '../components/LocationSearch.jsx';
import ContinueButton from '../components/ContinueButton.jsx';
import '../styles/Plan.css';
import DateCalendar from '../components/DateCalendar.jsx';
import Activities from '../components/Activities.jsx';
import AddUsers from '../components/AddUsers.jsx';
import { createTrip } from '../api.js';

function Plan() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        activity_ids: selectedActivities.map(activity => activity.id), // Assuming activities have IDs
        invited_user_ids: addedUsers.map(user => user.id), // Assuming users have IDs
      };

      const response = await createTrip(payload);
      console.log('Trip created successfully:', response);
      alert('Trip created successfully!');
      
      // Reset form or navigate to trips list
      setSelectedActivities([]);
      setAddedUsers([]);
      setStartDate(new Date());
      setEndDate(null);
    } catch (error) {
      console.error('Error creating trip:', error);
      setError('Failed to create trip. Please try again.');
      alert('Failed to create trip. Please try again.');
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
      <LocationSearch />
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
      {/* Submit */}
      <div style={{ marginTop: '40px' }}>
        <ContinueButton
          onClick={handleSubmit}
          label="Finish Planning"
          disabled={!isValidRange || !isReadyToProceed}
        />
      </div>
    </div>
  );
}

export default Plan;
