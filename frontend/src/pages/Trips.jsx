import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function TripsPage() {
  const [view, setView] = useState("full"); // "full" or "grid"
  const navigate = useNavigate();

  const dummyTrips = [
    {
      id: 1,
      name: "Trip to Yosemite",
      date: "2024-07-01",
      activities: ["Hiking", "Camping"],
    },
    {
      id: 2,
      name: "Beach Vacation",
      date: "2024-08-15",
      activities: ["Swimming", "Sunbathing"],
    },
    {
      id: 3,
      name: "City Tour",
      date: "2024-09-10",
      activities: ["Museum", "Cafe Hopping"],
    },
    {
      id: 4,
      name: "Mountain Retreat",
      date: "2024-10-05",
      activities: ["Meditation", "Nature Walks"],
    },
    {
      id: 5,
      name: "Desert Safari",
      date: "2024-11-20",
      activities: ["Camel Ride", "Stargazing"],
    },
    {
      id: 6,
      name: "Ski Adventure",
      date: "2024-12-18",
      activities: ["Skiing", "Hot Chocolate"],
    },
    {
      id: 7,
      name: "Road Trip",
      date: "2025-01-10",
      activities: ["Driving", "Photo Stops"],
    },
    {
      id: 8,
      name: "Island Hopping",
      date: "2025-02-14",
      activities: ["Boating", "Snorkeling"],
    },
    {
      id: 9,
      name: "Historical Europe",
      date: "2025-03-01",
      activities: ["Castles", "Walking Tours"],
    },
    {
      id: 10,
      name: "Trip to Yosemite",
      date: "2024-07-01",
      activities: ["Hiking", "Camping"],
    },
    {
      id: 11,
      name: "Beach Vacation",
      date: "2024-08-15",
      activities: ["Swimming", "Sunbathing"],
    },
    {
      id: 12,
      name: "Beach Vacation",
      date: "2024-08-15",
      activities: ["Swimming", "Sunbathing"],
    },
    {
      id: 13,
      name: "City Tour",
      date: "2024-09-10",
      activities: ["Museum", "Cafe Hopping"],
    },
    {
      id: 14,
      name: "Mountain Retreat",
      date: "2024-10-05",
      activities: ["Meditation", "Nature Walks"],
    },
    {
      id: 15,
      name: "Desert Safari",
      date: "2024-11-20",
      activities: ["Camel Ride", "Stargazing"],
    },
    {
      id: 16,
      name: "Ski Adventure",
      date: "2024-12-18",
      activities: ["Skiing", "Hot Chocolate"],
    },
    {
      id: 17,
      name: "Road Trip",
      date: "2025-01-10",
      activities: ["Driving", "Photo Stops"],
    },
    {
      id: 18,
      name: "Island Hopping",
      date: "2025-02-14",
      activities: ["Boating", "Snorkeling"],
    },
    {
      id: 19,
      name: "Historical Europe",
      date: "2025-03-01",
      activities: ["Castles", "Walking Tours"],
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Trips</h2>
        <div>
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
        </div>
      </div>

      {view === "full" ? (
        <div className="flex flex-col gap-6 overflow-y-scroll max-h-[80vh] px-2">
          {dummyTrips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => navigate("/custom-trip")}
              className="w-full h-[400px] bg-gray-800 rounded-lg text-white hover:scale-[1.02] transition-transform p-6 shadow-lg flex flex-col justify-between"
            >
              <div>
                <h3 className="text-2xl font-semibold mb-2">{trip.name}</h3>
                <p className="text-sm mb-4">{trip.date}</p>
                <ul className="list-disc ml-5">
                  {trip.activities.map((a, idx) => (
                    <li key={idx}>{a}</li>
                  ))}
                </ul>
              </div>
              <p className="italic">Trip ID: {trip.id}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyTrips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => navigate("/custom-trip")}
              className="bg-gray-800 p-4 rounded-lg text-white shadow hover:scale-[1.02] transition-transform"
            >
              <h4 className="text-lg font-semibold">{trip.name}</h4>
              <p className="text-sm">{trip.date}</p>
              <ul className="text-sm mt-2 list-disc ml-4">
                {trip.activities.slice(0, 3).map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TripsPage;
