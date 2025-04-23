import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, followUser } from '../api';
import { ACCESS_TOKEN } from '../constants';
import '../styles/Profile.css';
import { AuthContext } from '../components/AuthContext';

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext);

    useEffect(() => {
        // Check authentication first
        if (!isAuthenticated) {
            console.log('User not authenticated, redirecting to login');
            navigate('/login');
            return;
        }
        
        fetchProfile();
    }, [navigate, isAuthenticated]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getProfile();
            console.log('Profile data:', data);
            
            // The response might be a single object or an array with one object
            if (Array.isArray(data)) {
                setProfile(data[0]); // Handle array response (list endpoint)
            } else {
                setProfile(data); // Handle single object response (detail endpoint)
            }
            
            setError(null);
        } catch (err) {
            console.error('Error fetching profile:', err);
            
            // Check for unauthorized error
            if (err.response && err.response.status === 401) {
                console.log('Authentication required, redirecting to login');
                navigate('/login');
                return;
            }
            
            // Show more detailed error message
            let errorMessage = 'Failed to load profile';
            if (err.response) {
                // Add status code
                errorMessage += ` (${err.response.status})`;
                
                // Add error message from backend if available
                if (err.response.data && err.response.data.error) {
                    errorMessage += `: ${err.response.data.error}`;
                }
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
    if (error) return <div className="profile-container">{error}</div>;
    if (!profile) return <div className="profile-container">Profile not found</div>;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <img 
                    src={profile.profile_picture || 'https://via.placeholder.com/150'} 
                    alt="Profile" 
                    className="profile-picture"
                />
                <div className="profile-info">
                    <h1>{profile.user.username}</h1>
                    <div className="profile-stats">
                        <span>{profile.followers_count} Followers</span>
                        <span>{profile.following_count} Following</span>
                        <span>{profile.trips_count} Trips</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;

