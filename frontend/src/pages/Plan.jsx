import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Home from '../components/LocationSearch.jsx';

//Reusable button
const ContinueButton = ({ onClick, disabled, label = 'Continue' }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    style={{
      backgroundColor: disabled ? '#ccc' : '#ff9933',
      color: 'white',
      padding: '10px 20px',
      fontSize: '16px',
      border: 'none',
      borderRadius: '5px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      marginTop: '20px',
    }}
  >
    {label}
  </button>
);

//Style helpers
const inputStyle = {
  padding: '10px',
  width: '300px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  marginBottom: '10px',
};

const userChipStyle = {
  display: 'inline-block',
  backgroundColor: '#e8f5e9',
  border: '1px solid #4CAF50',
  borderRadius: '20px',
  padding: '5px 10px',
  margin: '5px',
};

const activityBoxStyle = isSelected => ({
  padding: '20px',
  border: `2px solid ${isSelected ? '#4CAF50' : '#ccc'}`,
  borderRadius: '10px',
  backgroundColor: isSelected ? '#e8f5e9' : '#f9f9f9',
  cursor: 'pointer',
  transition: '0.2s ease',
  fontSize: '16px',
});

function Plan() {
  //Step control
  const [showActivityPrompt, setShowActivityPrompt] = useState(false);
  const [showUserPrompt, setShowUserPrompt] = useState(false);

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

  //UI Sections
  const renderCalendarStep = () => (
    <>
      <DatePicker
        selected={startDate}
        onChange={onDateChange}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        inline
      />
      <p>{dateRange}</p>
      <ContinueButton
        disabled={!isValidRange}
        onClick={() => setShowActivityPrompt(true)}
      />
    </>
  );

  const renderActivityStep = () => (
    <>
      <h3>Select your activities:</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '15px',
          maxWidth: '600px',
          margin: '30px auto',
        }}
      >
        {activities.map(activity => (
          <div
            key={activity}
            onClick={() => toggleActivity(activity)}
            style={activityBoxStyle(selectedActivities.includes(activity))}
          >
            {activity}
          </div>
        ))}
      </div>
      {selectedActivities.length > 0 && (
        <p>Selected: {selectedActivities.join(', ')}</p>
      )}
      <ContinueButton
        disabled={!isReadyToProceed}
        onClick={() => setShowUserPrompt(true)}
      />
    </>
  );

  const renderUserStep = () => (
    <>
      <h3>Add users to your trip:</h3>
      <input
        type="text"
        placeholder="Search users you follow..."
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
        style={inputStyle}
      />
      {suggestedUsers.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {suggestedUsers.map(user => (
            <li
              key={user}
              onClick={() => addUser(user)}
              style={{
                padding: '8px',
                cursor: 'pointer',
                backgroundColor: '#f0f0f0',
                margin: '4px auto',
                maxWidth: '300px',
                borderRadius: '5px',
              }}
            >
              {user}
            </li>
          ))}
        </ul>
      )}
      {addedUsers.length > 0 && (
        <>
          <h4>Added users:</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {addedUsers.map(user => (
              <li key={user} style={userChipStyle}>
                {user}
              </li>
            ))}
          </ul>
        </>
      )}
      <ContinueButton
        onClick={() => {
          const payload = {
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            activities: selectedActivities,
            invited_users: addedUsers,
          };

          console.log('📦 Data to send to backend:', payload);
          alert('Plan data has been logged to the console!');
        }}
        label="Finish Planning"
      />

      {/*
      <ContinueButton
        onClick={() => {
            const payload = {
            start_date: startDate.toISOString().split("T")[0],
            end_date: endDate.toISOString().split("T")[0],
            activities: selectedActivities,
            invited_users: addedUsers,
            };

            fetch("http://localhost:8000/api/plans/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to save plan");
                return res.json();
            })
            .then((data) => {
                console.log("Plan saved:", data);
                alert("Plan saved successfully!");
                // Optional: redirect or clear state
            })
            .catch((err) => {
                console.error("Error:", err);
                alert("There was an error saving your plan.");
            });
        }}
        label="Finish Planning"
        />
    */}
    </>
  );

  return (
    <div
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
      <section>
        <Home />
      </section>

      {/* Step 1: Dates */}
      <section>
        <h3>Pick a date range:</h3>
        <DatePicker
          selected={startDate}
          onChange={onDateChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          inline
        />
        <p>{dateRange}</p>
      </section>

      {/* Step 2: Activities */}
      <section
        style={{
          opacity: isValidRange ? 1 : 0.5,
          pointerEvents: isValidRange ? 'auto' : 'none',
          marginTop: '40px',
        }}
      >
        <h3>Select your activities:</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '15px',
            margin: '30px auto',
          }}
        >
          {activities.map(activity => (
            <div
              key={activity}
              onClick={() => toggleActivity(activity)}
              style={activityBoxStyle(selectedActivities.includes(activity))}
            >
              {activity}
            </div>
          ))}
        </div>
        {selectedActivities.length > 0 && (
          <p>Selected: {selectedActivities.join(', ')}</p>
        )}
      </section>

      {/* Step 3: Users */}
      <section
        style={{
          opacity: isReadyToProceed ? 1 : 0.5,
          pointerEvents: isReadyToProceed ? 'auto' : 'none',
          marginTop: '40px',
        }}
      >
        <h3>Add users to your trip:</h3>
        <input
          type="text"
          placeholder="Search users you follow..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          style={inputStyle}
        />
        {suggestedUsers.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {suggestedUsers.map(user => (
              <li
                key={user}
                onClick={() => addUser(user)}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  backgroundColor: '#f0f0f0',
                  margin: '4px auto',
                  maxWidth: '300px',
                  borderRadius: '5px',
                }}
              >
                {user}
              </li>
            ))}
          </ul>
        )}
        {addedUsers.length > 0 && (
          <>
            <h4>Added users:</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {addedUsers.map(user => (
                <li key={user} style={userChipStyle}>
                  {user}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* Submit */}
      <div style={{ marginTop: '40px' }}>
        <ContinueButton
          onClick={() => {
            const payload = {
              start_date: startDate.toISOString().split('T')[0],
              end_date: endDate.toISOString().split('T')[0],
              activities: selectedActivities,
              invited_users: addedUsers,
            };

            console.log('📦 Data to send to backend:', payload);
            alert('Plan data has been logged to the console!');
          }}
          label="Finish Planning"
          disabled={!isValidRange || !isReadyToProceed}
        />
      </div>
    </div>
  );
}

export default Plan;
