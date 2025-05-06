// Correct approach
import React from "react";
import { Trash2 } from "lucide-react";

const DeleteTripButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
      title="Delete trip"
    >
      <Trash2 className="w-4 h-4" />
      Delete
    </button>
  );
};

export default DeleteTripButton;
