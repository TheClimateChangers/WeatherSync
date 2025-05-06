// components/AddActivityButton.jsx
import React from "react";
import { Plus } from "lucide-react";

const AddActivityButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-sm text-white border-1 rounded-2xl p-1 m-1 bg-orange-400 ml-4 transform hover:scale-[1.02] transition-all duration-50"
    >
      <Plus className="w-4 h-4" />
      Add Activity
    </button>
  );
};

export default AddActivityButton;
