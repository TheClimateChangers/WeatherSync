import React from 'react';

const AddUsers = ({
  searchInput,
  setSearchInput,
  suggestedUsers,
  addUser,
  addedUsers,
  isReadyToProceed,
}) => (
  <div className={`fade-in ${!isReadyToProceed && 'disabled'}`}>
    <h3>Add users to your trip:</h3>
    <input
      type="text"
      placeholder="Search users you follow..."
      value={searchInput}
      onChange={e => setSearchInput(e.target.value)}
      className="search-input bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition ease-in-out duration-100"
    />
    {suggestedUsers.length > 0 && (
      <ul className="suggestion-list">
        {suggestedUsers.map(user => (
          <li key={user} onClick={() => addUser(user)}>
            {user}
          </li>
        ))}
      </ul>
    )}
    {addedUsers.length > 0 && (
      <>
        <h4>Added users:</h4>
        <ul className="user-list">
          {addedUsers.map(user => (
            <li key={user} className="user-chip">
              {user}
            </li>
          ))}
        </ul>
      </>
    )}
  </div>
);

export default AddUsers;
