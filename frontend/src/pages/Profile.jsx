import React, { useState } from "react";

const Profile = () => {
  const [name, setName] = useState("Jeff Jefferson");
  const [email, setEmail] = useState("jeffyforpres@gmail.com");
  const [editingField, setEditingField] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const stats = {
    tripsCreated: 12,
    accountCreated: "2023-10-15",
    followers: 24,
    friends: 8,
  };

  const handleSave = () => {
    setEditingField(null);
  };

  const handlePhotoChange = () => {
    alert("Change photo clicked");
  };

  const handlePhotoRemove = () => {
    alert("Remove photo clicked");
  };

  const handlePasswordReset = () => {
    alert(`Password reset to: ${newPassword}`);
    setNewPassword("");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 font-sans">
      <h2 className="text-xl font-semibold">Profile Photo</h2>
      <div className="flex items-center justify-between">
        <div className="w-16 h-16 rounded-full bg-[#5c4033] text-white flex items-center justify-center text-xl font-bold">
          {name.charAt(0)}
        </div>
        <div className="space-x-4">
          <button
            onClick={handlePhotoRemove}
            className="border px-4 py-2 rounded-md text-sm"
          >
            Remove photo
          </button>
          <button
            onClick={handlePhotoChange}
            className="border px-4 py-2 rounded-md text-sm"
          >
            Change photo
          </button>
        </div>
      </div>

      <hr />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">Name</p>
            {editingField === "name" ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 border px-3 py-2 rounded-md w-full"
              />
            ) : (
              <p className="mt-1">{name}</p>
            )}
          </div>
          {editingField === "name" ? (
            <button
              onClick={handleSave}
              className="ml-4 border px-4 py-2 rounded-md"
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => setEditingField("name")}
              className="ml-4 border px-4 py-2 rounded-md"
            >
              Edit
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">Email address</p>
            {editingField === "email" ? (
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 border px-3 py-2 rounded-md w-full"
              />
            ) : (
              <p className="mt-1">{email}</p>
            )}
          </div>
          {editingField === "email" ? (
            <button
              onClick={handleSave}
              className="ml-4 border px-4 py-2 rounded-md"
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => setEditingField("email")}
              className="ml-4 border px-4 py-2 rounded-md"
            >
              Edit
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="w-full">
            <p className="text-sm text-gray-600 font-medium">Password</p>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 border px-3 py-2 rounded-md w-full"
            />
          </div>
          <button
            onClick={handlePasswordReset}
            className="ml-4 mt-6 border px-4 py-2 rounded-md"
          >
            Reset
          </button>
        </div>
      </div>

      <hr className="my-6" />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 font-medium">Trips Created</p>
          <p className="font-medium">{stats.tripsCreated}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 font-medium">Account Created</p>
          <p className="font-medium">
            {new Date(stats.accountCreated).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-6">
        <h2 className="text-xl font-semibold">Connections</h2>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 font-medium">Followers</p>
          <p className="font-medium">{stats.followers}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 font-medium">Friends</p>
          <p className="font-medium">{stats.friends}</p>
        </div>
      </div>

      <div className="pt-6 text-right">
        <button
          onClick={() => alert("All changes saved!")}
          className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Profile;

