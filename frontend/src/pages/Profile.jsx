import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, followUser, updateProfile } from '../api';
import { ACCESS_TOKEN } from '../constants';
import '../styles/Profile.css';

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        bio: '',
        location: '',
        website: ''
    });
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
            setFormData({
                bio: data[0]?.bio || '',
                location: data[0]?.location || '',
                website: data[0]?.website || ''
            });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(formData);
            fetchProfile(); // Refresh profile data
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating profile:', err);
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
                    <p className="bio">{profile.bio}</p>
                    <div className="profile-stats">
                        <span>{profile.followers_count} Followers</span>
                        <span>{profile.following_count} Following</span>
                        <span>{profile.trips_count} Trips</span>
                    </div>
                </div>
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="profile-edit-form">
                    <div className="form-group">
                        <label>Bio</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            placeholder="Tell us about yourself"
                        />
                    </div>
                    <div className="form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            placeholder="Your location"
                        />
                    </div>
                    <div className="form-group">
                        <label>Website</label>
                        <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({...formData, website: e.target.value})}
                            placeholder="Your website"
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="save-button">Save Changes</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="cancel-button">
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="profile-actions">
                    <button onClick={() => setIsEditing(true)} className="edit-button">
                        Edit Profile
                    </button>
                </div>
            )}

            <div className="profile-content">
                <h2>Recent Trips</h2>
                {profile.recent_trips && profile.recent_trips.length > 0 ? (
                    <div className="trips-grid">
                        {profile.recent_trips.map(trip => (
                            <div key={trip.id} className="trip-card">
                                <h3>{trip.title}</h3>
                                <p>{trip.description}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No trips yet</p>
                )}
            </div>
        </div>
    );
}

export default Profile;

