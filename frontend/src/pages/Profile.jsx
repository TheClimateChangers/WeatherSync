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
    const [retryCount, setRetryCount] = useState(0);
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
            const isGoogleAuth = tokenPayload.iss && tokenPayload.iss.includes('securetoken.google.com');
            setTokenType(isGoogleAuth ? 'Google Firebase' : 'Django JWT');
            console.log('Auth token type:', isGoogleAuth ? 'Google Firebase' : 'Django JWT');
            console.log('User ID in token:', tokenPayload.user_id || tokenPayload.sub || tokenPayload.uid);
            console.log('Django User ID in localStorage:', localStorage.getItem('DJANGO_USER_ID'));
        } catch (e) {
            console.error('Error parsing token:', e);
            setTokenType('Unknown');
        }
        
        fetchProfile();
    }, [navigate, retryCount]); // Add retryCount as dependency to trigger refetch

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
                    
                    // Check if it might be a Google token issue
                    const token = localStorage.getItem(ACCESS_TOKEN);
                    if (token) {
                        try {
                            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                            const isGoogleAuth = tokenPayload.iss && tokenPayload.iss.includes('securetoken.google.com');
                            
                            if (isGoogleAuth) {
                                errorMessage = 'Authentication issue with Google login. Please wait while we try to fix it...';
                            }
                        } catch (e) {
                            console.error('Error parsing token in error handler:', e);
                        }
                    }
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
    
    const handleRetry = async () => {
        // Increment retry count to trigger a refetch via useEffect
        setRetryCount(prevCount => prevCount + 1);
    };

    if (loading) return <div className="profile-container">Loading profile...</div>;
    if (error) return (
        <div className="profile-container">
            <div className="error">{error}</div>
            {tokenType && (
                <div className="debug-info">
                    <p>Authentication type: {tokenType}</p>
                    <p>User ID from localStorage: {localStorage.getItem('DJANGO_USER_ID')}</p>
                    <p>Retry count: {retryCount}</p>
                    <button onClick={handleRetry} className="retry-btn">
                        Retry
                    </button>
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

