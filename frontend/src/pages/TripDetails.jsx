import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getTripById, addNextTripDay, deleteTripDay } from "../api";
import { ChevronDown, ChevronUp } from 'lucide-react';
import ActivityItem from "../components/ActivityItem";
import AddActivityButton from "../components/AddActivityButton";
import AddUsers from "../components/AddUsers";
import MapView from "../components/MapView";
import AddActivityModal from "../components/AddActivityModal";
import AddUserModal from "../components/AddUserModal";

function formatDateRange(start, end) {
  const format = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}`;
  };
  return `${format(start)} - ${format(end)}`;
}

function parseDateLocal(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function TripDetails() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const toggleDay = (date) => {
    setExpandedDay((prev) => (prev === date ? null : date));
  };

  const fetchTripDetails = async () => {
    try {
      const tripData = await getTripById(tripId);
      setTrip(tripData);
    } catch (error) {
      console.error("Failed to load trip details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  const handleAddDay = async () => {
    try {
      await addNextTripDay(tripId);
      await fetchTripDetails(); // Refresh trip data after adding a day
    } catch (error) {
      console.error("Error adding day:", error);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  // Log day.weather to the console
  useEffect(() => {
    if (trip) {
      trip.days.forEach((day) => {
        console.log("Weather for the day:", day.weather);
      });
    }
  }, [trip]);

  if (loading) return <p>Loading trip data...</p>;
  if (!trip) return <p>Trip not found</p>;

  const { location, start_date, end_date, invited_users, days } = trip;

  return (
    <>
      {/* Trip Title + Date Range + Users */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
        <div className="flex-1">
          <h2 className="text-3xl font-bold">Trip to {location}</h2>
          <p className="text-gray-600 text-sm mt-1">
            {formatDateRange(start_date, end_date)}
          </p> 
        </div>
        {/* Invited Users Section */}
          <div className="w-full lg:w-1/3 bg-gray-100 p-4 rounded shadow">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-semibold">Invited Users</h4>
              <AddUsers onClick={() => setShowUserModal(true)} />
            </div>
            {invited_users.length > 0 ? (
              <ul className="list-disc ml-5">
                {invited_users.map((user) => (
                  <li key={user.id}>{user.username}</li>
                ))}
              </ul>
            ) : (
              <p className="italic text-gray-500">No users invited.</p>
            )}
          </div>
      </div>

      {/* === Daily Trip Sections === */}
      {days.map((day) => {
        const date = parseDateLocal(day.date);
        const isOpen = expandedDay === day.date;

        const timeSlots = ["morning", "lunch", "afternoon", "dinner", "evening", "night"];
        const slotMap = {};
        timeSlots.forEach(slot => slotMap[slot] = []);

        day.activities.forEach((activity) => {
          if (slotMap[activity.time_slot]) {
            slotMap[activity.time_slot].push(activity);
          }
        });

        return (
          <div key={day.date} className="mb-6 rounded">
            {/* Header with dropdown */}
            <div
              className="relative flex justify-between items-center rounded-2xl shadow px-4 py-3 bg-gray-100 cursor-pointer"
              onClick={() => toggleDay(day.date)}
            >
              <h3 className="text-lg font-bold text-orange-500">
                {date.toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <div className="flex justify-right">
                <button
                  onClick={async (e) => {
                    e.stopPropagation(); // prevent click from expanding
                    try {
                      await deleteTripDay(tripId, day.id); // Call your delete API
                      // Update local state to remove the deleted day
                      fetchTripDetails();
                    } catch (err) {
                      console.error("Failed to delete trip day:", err);
                      // Optionally show user feedback here
                    }
                  }}
                  className="absolute top-2 right-15 text-red-500 text-sm hover:underline hover:text-red-600"
                  title="Delete activity"
                >
                  Delete
                </button>
              </div>
              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {isOpen && (
              <div className="p-4 flex flex-col gap-6">
                <div className="flex flex-col lg:flex-row gap-4">
                <div className="w-full lg:w-2/3">
                  {/* Map View */}
                  <MapView activities={day.activities} location={location} />
                  </div>
                  {/* Forecast */}
                  <div className="w-full lg:w-1/3 bg-blue-100 text-blue-800 rounded px-4 py-4 text-center shadow">
                    <br />
                    <h4 className="text-xl font-bold mb-1">Forecast</h4>
                    <br />
                    {/* <p className="italic text-md my-2">{day.weather?.description || 'Weather forecast'}</p> */}
                    <p>
                      <span className="text-lg">
                        {day.weather?.temperature ? `Temperature: ` : 'Temperature: '}
                        <span className="font-bold text-xl">
                          {day.weather?.temperature ? `${day.weather.temperature.toFixed(0)}°` : 'N/A'}
                        </span>
                      </span>
                      <br />
                      <span className="text-lg">
                        {day.weather?.rain_chance ? `Rain: ` : 'Rain: '}
                        <span className="font-bold text-xl">
                          {day.weather?.rain_chance ? `${day.weather.rain_chance*.01}%` : 'N/A'}
                        </span>
                      </span>
                      <br />
                      <span className="text-lg">
                        {day.weather?.weather_conditions.cloud_cover ? `Cloud Cover: ` : 'Cloud Cover: '}
                        <span className="font-bold text-xl">
                          {day.weather?.weather_conditions.cloud_cover ? `${day.weather.weather_conditions.cloud_cover}%` : 'N/A'}
                        </span>
                      </span>
                      <br />
                      <span className="text-lg">
                        {day.weather?.weather_conditions.humidity ? `Humidity: ` : 'Humidity: '}
                        <span className="font-bold text-xl">
                          {day.weather?.weather_conditions.humidity ? `${day.weather.weather_conditions.humidity}%` : 'N/A'}
                        </span>
                      </span>
                      <br />
                      <span className="text-lg">
                        {day.weather?.weather_conditions.wind ? `Wind: ` : 'Wind: '}
                        <span className="font-bold text-xl">
                          {day.weather?.weather_conditions.wind ? `${day.weather.weather_conditions.wind} mph` : 'N/A'}
                        </span>
                      </span>
                    </p>
                  </div>

                
                </div>

                {/* Suggested Plan */}
                <div>
                <h4 className="text-md font-semibold mb-2">Suggested Plan</h4>
                {timeSlots.map((slot) => {
                  const activities = slotMap[slot].filter(
                    (a) => a.activity?.source === "YELP" || a.activity?.source === "TICKETMASTER"
                  );

                  return (
                    <div key={slot} className="mb-4">
                      <div className="flex items-center justify-left">
                        <h5 className="text-md font-semibold capitalize mb-1">{slot}</h5>
                          <AddActivityButton onClick={() => setShowModal(true)} />
                      </div>
                      <ul className="list-none ml-5">
                        {activities.length > 0 ? (
                          activities.map((a) => (
                            <li key={a.id} className="mb-2">
                              <ActivityItem activity={a.activity} />
                            </li>
                          ))
                        ) : (
                          <li className="mb-2">
                            <ActivityItem activity={null} />
                          </li>
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
              </div>
            )}
          </div>
        );
      })}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => handleAddDay(tripId)}
          className="bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded-2xl shadow transition-all"
        >
          + Add a Day
        </button>
        <AddActivityModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </div>
      <AddUserModal
  isOpen={showUserModal}
  onClose={() => setShowUserModal(false)}
  onAddUser={(user) => console.log("User added:", user)}
/>

    </>
    
  );
}

export default TripDetails;