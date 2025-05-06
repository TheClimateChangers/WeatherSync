import React, { useState } from "react";
import { getActivities } from "../api"; // Import your getActivities function

export default function AddActivityModal({ isOpen, onClose, addToTrip, location }) {
  const [activeTab, setActiveTab] = useState("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  // For custom activity form
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customLocation, setCustomLocation] = useState("");

  const trip_location =
    location && location.trim()
      ? location.split(",").slice(0, 2).join("").trim()
      : "Los Angeles";

  if (!isOpen) return null;

  // Handle search form submission
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log(`AAM Location: ${trip_location}`);
      const data = {
        location: trip_location,
        categories: searchTerm,
        limit: 10,
      };
      const result = await getActivities(data);
      setActivities(result);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search-based activity selection
  const handleActivitySelect = (activity) => {
    addToTrip(activity);
    onClose();
  };

  // Handle custom activity submission
  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const customActivity = {
      id: `custom-${Date.now()}`, // Unique ID
      name: customName,
      description: customDescription,
      location: customLocation,
      isCustom: true,
    };
    addToTrip(customActivity);
    onClose();

    // Reset custom form
    setCustomName("");
    setCustomDescription("");
    setCustomLocation("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>

        <h3 className="text-lg font-bold mb-4">Add Activity</h3>

        {/* Tab Navigation */}
        <div className="flex mb-4 border-b">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "search"
                ? "border-b-2 border-orange-500 text-orange-500"
                : "text-gray-500 hover:text-orange-500"
            }`}
            onClick={() => setActiveTab("search")}
          >
            Search Activity
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "custom"
                ? "border-b-2 border-orange-500 text-orange-500"
                : "text-gray-500 hover:text-orange-500"
            }`}
            onClick={() => setActiveTab("custom")}
          >
            + Custom Activity
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "search" ? (
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search term or keyword"
              className="w-full mb-3 p-2 border border-gray-300 rounded"
            />
            <button
              type="submit"
              className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded"
            >
              {loading ? "Searching..." : "Search"}
            </button>

            {loading ? (
              <div>Loading...</div>
            ) : (
              <ul className="mt-4 max-h-60 overflow-y-auto">
                {activities.map((activity) => (
                  <li
                    key={activity.id}
                    className="p-2 border-b cursor-pointer hover:bg-gray-100"
                    onClick={() => handleActivitySelect(activity)}
                  > <div className="flex">
                    <img className="h-10 w-10 mr-3" src={activity.image_url} alt="image" />
                    {activity.name}

                  </div>
                  </li>
                ))}
              </ul>
            )}
          </form>
        ) : (
          <form onSubmit={handleCustomSubmit}>
            <input
              type="text"
              placeholder="Activity name"
              className="w-full mb-3 p-2 border border-gray-300 rounded"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              required
            />
            <textarea
              placeholder="Description"
              className="w-full mb-3 p-2 border border-gray-300 rounded"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
            />
            <input
              type="text"
              placeholder="Location (optional)"
              className="w-full mb-3 p-2 border border-gray-300 rounded"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
            />
            <button
              type="submit"
              className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded"
            >
              Add Custom Activity
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
