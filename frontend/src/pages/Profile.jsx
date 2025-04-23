import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, followUser } from '../api';
import { ACCESS_TOKEN } from '../constants';
import '../styles/Profile.css';

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            navigate('/login');
            return;
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
    if (error) return <div className="profile-container error">{error}</div>;
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
                        <span>{profile.trips_count || 0} Trips</span>
                    </div>
                </div>
            </div>
            <div className="profile-content">
                <h2>My Trips</h2>
                {/* Display trips here */}
                <div className="no-trips-message">
                    {profile.trips_count ? 'Your trips will appear here' : 'You haven\'t created any trips yet'}
                </div>
            </div>
        </div>
    );
}

export default Profile;

