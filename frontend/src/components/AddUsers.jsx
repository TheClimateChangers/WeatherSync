import React from 'react';

const AddUsers = ({
  searchInput,
  setSearchInput,
  suggestedUsers,
  addUser,
  addedUsers,
  isReadyToProceed,
}) => (
  <section className={`fade-in ${!isReadyToProceed && 'disabled'}`}>
    <h3>Add users to your trip:</h3>
    <input
      type="text"
      placeholder="Search users you follow..."
      value={searchInput}
      onChange={e => setSearchInput(e.target.value)}
      className="search-input"
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
  </section>
);

export default AddUsers;
