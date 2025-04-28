import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getTripById } from "../api"; // You should define this API helper
//import AddUserImage from "../assets/add-user.png";

function daysUntil(dateString) {
  const today = new Date();
  const target = new Date(dateString);
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getDateRange(start, end) {
  const range = [];
  let current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    range.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return range;
}

function formatDateRange(start, end) {
  const format = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };
  return `${format(start)} - ${format(end)}`;
}

function TripDetails() {
  const { tripId } = useParams();
  //console.log('Trip ID from URL:', tripId);
  const [trip, setTrip] = useState(null);
  const [suggestedEvents, setSuggestedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const tripData = await getTripById(tripId);
        setTrip(tripData);

        // Optionally fetch Yelp/Ticketmaster events based on trip location
        // if (tripData.location) {
        //   const events = await getYelpActivities(tripData.location);
        //   setSuggestedEvents(events.slice(0, 5)); // Limit to 5 events
        // }
      } catch (error) {
        console.error("Failed to load trip details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [tripId]);

  if (loading) return <p>Loading trip data...</p>;
  if (!trip) return <p>Trip not found</p>;

  const { name, start_date, end_date, activities, invited_users, days } = trip;
  const tripDates = getDateRange(start_date, end_date);

  return (
    <>
      {/* Trip Title + Date Range + Users */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">{name}</h2>
          <p className="text-gray-600 text-sm mt-1">
            {formatDateRange(start_date, end_date)}
          </p>
        </div>

        {/* Invited Users */}
        <div className="flex items-center gap-2">
          {invited_users.map((user, idx) => (
            <div
              key={user.id}
              className="w-10 h-10 rounded-full bg-gray-300 text-xs flex items-center justify-center font-semibold text-white"
              style={{ backgroundColor: ["#7E57C2", "#29B6F6", "#66BB6A"][idx % 3] }}
              title={`@${user.username}`}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
          ))}

          {/* Add user button (non-functional for now) */}
          <button
            className="w-10 h-10 rounded-full bg-orange-400 text-white flex items-center justify-center text-xl font-bold shadow hover:bg-orange-500"
            title="Add user"
          >
            {/* <img src={AddUserImage} alt="Add user" className="w-full h-full object-cover" /> */}
          </button>
        </div>
      </div>

      {/* === Daily Trip Sections === */}
      {tripDates.map((date) => {
        const dateStr = date.toISOString().split("T")[0];
        const dayData = days.find(d => d.date === dateStr);
        const weather = dayData?.weather;

        return (
          <div key={dateStr} className="mb-10 p-4 border rounded shadow">
            <h3 className="text-xl font-bold text-orange-500 mb-2">{dateStr}</h3>

            {/* Weather */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Hourly Forecast</h4>
              {weather ? (
                <div className="flex flex-col">
                  <p>Description: {weather.description}</p>
                  <p>Temperature: {weather.temperature}°C</p>
                </div>
              ) : (
                <p className="italic text-gray-500">No forecast for this day.</p>
              )}
            </div>

            {/* Activities */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold">Planned Activities</h4>
              {activities.length > 0 ? (
                <ul className="list-disc ml-5">
                  {activities.map((a) => (
                    <li key={a.id}>
                      {a.name} {a.rating ? `— Rating: ${a.rating}` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="italic text-gray-500">No activities planned.</p>
              )}
            </div>

            {/* Suggested Events */}
            <div>
              <h4 className="text-lg font-semibold">Suggested Events</h4>
              {suggestedEvents.length > 0 ? (
                <ul className="list-disc ml-5">
                  {suggestedEvents.map((event) => (
                    <li key={event.id}>
                      {event.name} — {event.categories.join(", ")} — {event.rating}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="italic text-gray-500">No suggested events found.</p>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

export default TripDetails;