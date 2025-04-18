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
        try {
            const data = await getProfile();
            setProfile(data[0]); // Get the first (and only) profile from the list
            setError(null);
        } catch (err) {
            setError('Failed to load profile');
            console.error('Error fetching profile:', err);
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

    if (loading) return <div className="profile-container">Loading...</div>;
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

