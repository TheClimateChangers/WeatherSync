import React from "react";
import { Trash2 } from "lucide-react";
import { deleteTrip } from "../api";

const DeleteTripButton = ({ tripId, onDeleteSuccess }) => {
  const handleClick = async (e) => {
    e.stopPropagation(); // prevent card click
    const confirmed = window.confirm("Are you sure you want to delete this trip?");
    if (!confirmed) return;

    try {
      await deleteTrip(tripId);
      if (onDeleteSuccess) onDeleteSuccess(tripId);
    } catch (error) {
      console.error("Failed to delete trip:", error);
      alert("Failed to delete the trip. Please try again.");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
      title="Delete trip"
    >
      <Trash2 className="w-4 h-4" />
      Delete
    </button>
  );
};

export default DeleteTripButton;
