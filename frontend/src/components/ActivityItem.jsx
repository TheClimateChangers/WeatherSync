import React, { useState } from "react";
import { deleteActivity } from "../api";

function formatTime(timeStr) {
    const date = new Date(`1970-01-01T${timeStr}`);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

function ActivityItem({ activity, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  if (!activity) {
    return (
      <div className="p-3 bg-gray-200 text-gray-500 rounded-md mb-2">
        No activities
      </div>
    );
  }

  const handleDelete = async (e) => {
    e.stopPropagation(); // prevent click from expanding
    try {
      await deleteActivity(activity.trip_id, activity.id); // Assuming activity contains a trip_id and id
      onDelete(activity.id); // Remove the activity from parent component's state
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`relative flex flex-col sm:flex-row items-start gap-3 bg-slate-300 p-3 rounded-md mb-2 cursor-pointer transition-all duration-300 ${
        expanded ? "shadow-lg scale-102" : "hover:scale-[1.02]"
      }`}
    >
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 text-red-500 text-sm hover:underline hover:text-red-600"
        title="Delete activity"
      >
        Delete
      </button>

      {activity.image_url && (
        <img
          src={activity.image_url}
          alt={activity.name}
          className="w-16 h-16 object-cover rounded"
        />
      )}
      <div>
        <span className="font-semibold">{activity.name}</span>
        {activity.categories?.length > 0 && (
          <span className="text-sm text-gray-600 italic">
            {" — "}{activity.categories}
          </span>
        )}
        <a
          href={activity.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block font-thin text-sm text-blue-600 italic underline mt-1"
          onClick={(e) => e.stopPropagation()} // avoid toggle on link click
        >
          View more
        </a>

        {expanded && (
  <div className="mt-2 text-sm text-gray-700 space-y-1">
    <p><strong>Address:</strong> {activity.address || "N/A"}</p>
    <p><strong>Rating:</strong> {activity.rating ? `${activity.rating} ⭐` : "N/A"}</p>
    <p>
      <strong>Hours:</strong>{" "}
      {activity.start_time && activity.end_time
        ? `${formatTime(activity.start_time)} – ${formatTime(activity.end_time)}`
        : "Not available"}
    </p>
  </div>
)}
      </div>
    </div>
  );
}

export default ActivityItem;
