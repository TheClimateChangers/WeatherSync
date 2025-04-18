import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, followUser } from '../api';
import { ACCESS_TOKEN } from '../constants';
import '../styles/Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
          navigate('/login');
          return;
        }
        const data = await getProfile('me');
        setProfile(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleFollow = async () => {
    try {
      const response = await followUser(profile.id);
      setProfile(prev => ({
        ...prev,
        is_following: !prev.is_following,
        follower_count: response.status === 'followed' 
          ? prev.follower_count + 1 
          : prev.follower_count - 1
      }));
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img 
          src={profile.profile_picture || '/default-profile.png'} 
          alt="Profile" 
          className="profile-picture"
        />
        <div className="profile-info">
          <h1>{profile.username}</h1>
          <div className="stats">
            <span>{profile.follower_count} Followers</span>
            <span>{profile.following_count} Following</span>
            <span>{profile.trips_created_count} Trips Created</span>
          </div>
          <button 
            onClick={handleFollow}
            className={`follow-button ${profile.is_following ? 'following' : ''}`}
          >
            {profile.is_following ? 'Unfollow' : 'Follow'}
          </button>
        </div>
      </div>
      
      <div className="profile-content">
        <div className="details-section">
          <h2>Account Details</h2>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Member since:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;

