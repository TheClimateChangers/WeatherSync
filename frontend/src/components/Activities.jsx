import React from 'react';
import '../styles/Plan.css'; // Make sure styles are available

const Activities = ({ activities, selectedActivities, toggleActivity }) => {
  return (
    <div
      style={{
        marginTop: '40px',
      }}
    >
      <h3>Select your activities:</h3>
      <div className="activity-grid">
        {activities.map(activity => (
          <div
            key={activity}
            onClick={() => toggleActivity(activity)}
            className={`activity-box ${selectedActivities.includes(activity) ? 'selected' : ''}`}
          >
            {activity}
          </div>
        ))}
      </div>
      {selectedActivities.length > 0 && (
        <p>Selected: {selectedActivities.join(', ')}</p>
      )}
    </div>
  );
};

export default Activities;
