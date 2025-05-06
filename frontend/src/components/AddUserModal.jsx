import React, { useState } from "react";

export default function AddUserModal({ isOpen, onClose, onAddUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const mockUsers = [
    { id: 1, username: "alice" },
    { id: 2, username: "bob" },
    { id: 3, username: "charlie" },
  ];

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      const results = mockUsers.filter((user) =>
        user.username.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleAdd = (user) => {
    onAddUser(user);
    onClose();
    setSearchTerm("");
    setSearchResults([]);
  };

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
        <h3 className="text-lg font-bold mb-4">Add User</h3>
        <input
          type="text"
          placeholder="Search by username"
          value={searchTerm}
          onChange={handleSearch}
          className="w-full mb-3 p-2 border border-gray-300 rounded"
        />
        <ul className="max-h-40 overflow-y-auto">
          {searchResults.map((user) => (
            <li
              key={user.id}
              className="flex justify-between items-center p-2 border-b"
            >
              <span>{user.username}</span>
              <button
                onClick={() => handleAdd(user)}
                className="text-sm bg-orange-400 hover:bg-orange-500 text-white px-2 py-1 rounded"
              >
                Add
              </button>
            </li>
          ))}
          {searchTerm && searchResults.length === 0 && (
            <li className="text-gray-500 italic p-2">No users found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
