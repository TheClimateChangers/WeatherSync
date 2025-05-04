import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getTripById } from "../api";
import { ChevronDown, ChevronUp } from 'lucide-react';

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

  const toggleDay = (date) => {
    setExpandedDay((prev) => (prev === date ? null : date));
  };

  useEffect(() => {
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
    fetchTripDetails();
  }, [tripId]);

  if (loading) return <p>Loading trip data...</p>;
  if (!trip) return <p>Trip not found</p>;

  const { location, start_date, end_date, invited_users, days } = trip;

  return (
    <>
      {/* Trip Title + Date Range + Users */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">Trip to {location}</h2>
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
          <div key={day.date} className="mb-6 border rounded shadow">
            {/* Header with dropdown */}
            <div
              className="flex justify-between items-center px-4 py-3 bg-gray-100 cursor-pointer"
              onClick={() => toggleDay(day.date)}
            >
              <h3 className="text-lg font-bold text-orange-600">
                {date.toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {isOpen && (
              <div className="p-4 flex flex-col gap-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Selected Plan */}
                  <div className="flex-1 border p-4 rounded">
                    <h4 className="text-md font-semibold mb-2">Selected Plan</h4>
                    {day.activities.filter(a => !a.activity.source || (a.activity.source !== 'YELP' && a.activity.source !== 'TICKETMASTER')).length > 0 ? (
                      <ul className="list-disc ml-5">
                        {day.activities.filter(a => !a.activity.source || (a.activity.source !== 'YELP' && a.activity.source !== 'TICKETMASTER')).map((a) => (
                          <li key={a.id}>{a.activity.name}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="italic text-gray-500">No activities selected.</p>
                    )}
                  </div>

                  {/* Forecast */}
                  <div className="flex-1 bg-blue-100 text-blue-800 rounded px-4 py-4 text-center shadow">
                    <h4 className="text-md font-bold mb-1">Forecast</h4>
                    <p className="text-sm font-semibold">7 AM</p>
                    <p className="italic text-md my-2">{day.weather?.description || 'Weather forecast'}</p>
                    <p className="text-xl font-bold">
                      {day.weather?.temperature ? `${day.weather.temperature.toFixed(0)}°` : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Suggested Plan by Time Slot */}
                <div>
                  <h4 className="text-md font-semibold mb-2">Suggested Plan</h4>
                  {timeSlots.map((slot) => (
                    <div key={slot} className="mb-4">
                      <h5 className="text-sm font-semibold capitalize mb-1">{slot}</h5>
                      {slotMap[slot].filter(a => a.activity.source === 'YELP' || a.activity.source === 'TICKETMASTER').length > 0 ? (
                        <ul className="list-disc ml-5">
                          {slotMap[slot].filter(a => a.activity.source === 'YELP' || a.activity.source === 'TICKETMASTER').map((a) => (
                            <li key={a.id}>
                              <span className="font-semibold">{a.activity.name}</span>
                              {a.activity.categories?.length > 0 && (
                                <span className="text-sm text-gray-600 italic"> — {a.activity.categories.join(", ")}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm italic text-gray-500">No suggestions</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export default TripDetails;