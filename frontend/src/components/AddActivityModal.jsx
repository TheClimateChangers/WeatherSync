// components/AddActivityModal.js
import React, { useState } from "react";

export default function AddActivityModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("search"); // 'search' or 'custom'

  if (!isOpen) return null;

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
          <form>
            <input
              type="text"
              placeholder="Search term or keyword"
              className="w-full mb-3 p-2 border border-gray-300 rounded"
            />
            <button
              type="submit"
              className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded"
            >
              Search
            </button>
          </form>
        ) : (
          <form>
            <input
              type="text"
              placeholder="Activity name"
              className="w-full mb-3 p-2 border border-gray-300 rounded"
            />
            <textarea
              placeholder="Description"
              className="w-full mb-3 p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Location (optional)"
              className="w-full mb-3 p-2 border border-gray-300 rounded"
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
