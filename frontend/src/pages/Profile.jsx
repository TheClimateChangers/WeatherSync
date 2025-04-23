import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, followUser } from '../api';
import { ACCESS_TOKEN } from '../constants';
import '../styles/Profile.css';

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tokenType, setTokenType] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            navigate('/login');
            return;
        }
        
        // Try to determine the token type (helpful for debugging)
        try {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            setTokenType(tokenPayload.iss && tokenPayload.iss.includes('securetoken.google.com') 
                ? 'Google Firebase' 
                : 'Django JWT');
            console.log('Auth token type:', tokenPayload.iss && tokenPayload.iss.includes('securetoken.google.com') 
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
            setError(null);
            console.log("Profile data loaded:", profileData);
        } catch (err) {
            console.error('Error fetching profile:', err);
            let errorMessage = 'Failed to load profile';
            
            // Check for specific error responses
            if (err.response) {
                if (err.response.status === 401) {
                    errorMessage = 'Your session has expired. Please login again.';
                    // Optional: redirect to login
                    // navigate('/login');
                } else if (err.response.data && err.response.data.error) {
                    errorMessage = err.response.data.error;
                }
                console.error('Error response:', err.response.data);
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        try {
            await followUser(profile.id);
            fetchProfile(); // Refresh profile data
        } catch (err) {
            console.error('Error following user:', err);
        }
    };

    if (loading) return <div className="profile-container">Loading profile...</div>;
    if (error) return (
        <div className="profile-container">
            <div className="error">{error}</div>
            {tokenType && (
                <div className="debug-info">
                    <p>Authentication type: {tokenType}</p>
                    <p>User ID from localStorage: {localStorage.getItem('DJANGO_USER_ID')}</p>
                    <button onClick={() => navigate('/login')} className="login-again-btn">
                        Login Again
                    </button>
                </div>
            )}
        </div>
    );
    if (!profile) return <div className="profile-container">Profile not found</div>;

    // Get data with fallbacks for any missing properties
    const username = profile.user?.username || 'User';
    const followersCount = profile.followers_count || 0;
    const followingCount = profile.following_count || 0;
    const tripsCount = profile.trips_count || 0;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <img 
                    src={profile.profile_picture || 'https://via.placeholder.com/150'} 
                    alt="Profile" 
                    className="profile-picture"
                />
                <div className="profile-info">
                    <h1>{username}</h1>
                    <div className="profile-stats">
                        <span>{followersCount} Followers</span>
                        <span>{followingCount} Following</span>
                        <span>{tripsCount} Trips</span>
                    </div>
                    <div className="auth-type">
                        {tokenType && <small>Auth: {tokenType}</small>}
                    </div>
                </div>
            </div>
            <div className="profile-content">
                <h2>My Trips</h2>
                {/* Display trips here */}
                <div className="no-trips-message">
                    {tripsCount > 0 ? 'Your trips will appear here' : 'You haven\'t created any trips yet'}
                </div>
            </div>
        </div>
    );
}

export default Profile;

