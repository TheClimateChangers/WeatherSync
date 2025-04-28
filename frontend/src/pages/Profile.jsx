import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, followUser, getTrips } from '../api';
import { ACCESS_TOKEN } from '../constants';
import '../styles/Profile.css';

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tokenType, setTokenType] = useState(null);
    const [trips, setTrips] = useState([]);
    const [tripsLoading, setTripsLoading] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();

    const [editedName, setEditedName] = useState('');
    const [editedEmail, setEditedEmail] = useState('');

    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            navigate('/login');
            return;
        }
        
        try {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            setTokenType(tokenPayload.iss && tokenPayload.iss.includes('securetoken.google.com') 
                ? 'Google Firebase' 
                : 'Django JWT');
        } catch (e) {
            console.error('Error parsing token:', e);
            setTokenType('Unknown');
        }
        
        fetchProfile();
    }, [navigate]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const profileData = await getProfile();
            setProfile(profileData);
            setEditedName(profileData.username || '');
            setEditedEmail(profileData.email || '');
            setError(null);
            
            fetchUserTrips();
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserTrips = async () => {
        setTripsLoading(true);
        try {
            const tripsData = await getTrips();
            const userDjangoId = localStorage.getItem('DJANGO_USER_ID');
            const userTrips = tripsData.filter(trip => 
                trip.creator && trip.creator.id.toString() === userDjangoId
            );
            setTrips(userTrips);
        } catch (err) {
            console.error('Error fetching trips:', err);
        } finally {
            setTripsLoading(false);
        }
    };

    const handleFollow = async () => {
        try {
            await followUser(profile.id);
            fetchProfile();
        } catch (err) {
            console.error('Error following user:', err);
        }
    };

    const handleSave = () => {
        setEditingField(null);
    };

    const handlePasswordReset = () => {
        alert(`Password reset to: ${newPassword}`);
        setNewPassword('');
    };

    if (loading) return <div className="profile-container">Loading profile...</div>;
    if (error) return <div className="profile-container"><div className="error">{error}</div></div>;
    if (!profile) return <div className="profile-container">Profile not found</div>;

    const followersCount = profile.followers_count || 0;
    const followingCount = profile.following_count || 0;
    const tripsCount = profile.trips_count || 0;

    const defaultProfilePic = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23808080'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

    return (
        <div className="profile-container">
            <div className="profile-header">
                <img 
                    src={profile.profile_picture || defaultProfilePic} 
                    alt="Profile" 
                    className="profile-picture"
                />
                <div className="profile-info">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Username</p>
                            {editingField === 'name' ? (
                                <input
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="mt-1 border px-3 py-2 rounded-md w-full"
                                />
                            ) : (
                                <p className="mt-1">{editedName}</p>
                            )}
                        </div>
                        {editingField === 'name' ? (
                            <button onClick={handleSave} className="ml-4 border px-4 py-2 rounded-md">
                                Save
                            </button>
                        ) : (
                            <button onClick={() => setEditingField('name')} className="ml-4 border px-4 py-2 rounded-md">
                                Edit
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Email</p>
                            {editingField === 'email' ? (
                                <input
                                    value={editedEmail}
                                    onChange={(e) => setEditedEmail(e.target.value)}
                                    className="mt-1 border px-3 py-2 rounded-md w-full"
                                />
                            ) : (
                                <p className="mt-1">{editedEmail}</p>
                            )}
                        </div>
                        {editingField === 'email' ? (
                            <button onClick={handleSave} className="ml-4 border px-4 py-2 rounded-md">
                                Save
                            </button>
                        ) : (
                            <button onClick={() => setEditingField('email')} className="ml-4 border px-4 py-2 rounded-md">
                                Edit
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-4">
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
                        <button onClick={handlePasswordReset} className="ml-4 mt-6 border px-4 py-2 rounded-md">
                            Reset
                        </button>
                    </div>

                    <div className="profile-stats mt-6">
                        <div><b>{followersCount}</b> Followers</div>
                        <div><b>{followingCount}</b> Following</div>
                        <div><b>{tripsCount}</b> Trips</div>
                        {tokenType && <small>Auth: {tokenType}</small>}
                    </div>
                </div>
            </div>

            <div className="profile-content">
                <h2>My Trips</h2>
                {tripsLoading ? (
                    <p>Loading trips...</p>
                ) : trips.length > 0 ? (
                    <div className="trips-list">
                        {trips.map(trip => (
                            <div key={trip.id} className="trip-card">
                                <h3>Trip to {trip.location || "Unknown"}</h3>
                                <p>Start: {new Date(trip.start_date).toLocaleDateString()}</p>
                                <p>End: {new Date(trip.end_date).toLocaleDateString()}</p>
                                <p>Activities: {trip.activities ? trip.activities.length : 0}</p>
                                <button 
                                    onClick={() => navigate(`/trips/${trip.id}`)}
                                    className="view-trip-btn"
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-trips-message">You haven't created any trips yet.</div>
                )}
            </div>
        </div>
    );
}

export default Profile;