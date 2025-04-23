import axios from "axios"
import { ACCESS_TOKEN } from "./constants"

const api = axios.create({
    baseURL: import.meta.env.VITE_URL_API
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            
            // Add debug logging for /api/profiles/me/ endpoint
            if (config.url && config.url.includes('/api/profiles/me/')) {
                console.log('Authentication token for profile request:', token);
                try {
                    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                    console.log('Token payload:', tokenPayload);
                    
                    // Check if token is Firebase or Django
                    const isGoogleAuth = tokenPayload.iss && tokenPayload.iss.includes('securetoken.google.com');
                    console.log('Token type:', isGoogleAuth ? 'Google Firebase' : 'Django JWT');
                    console.log('User ID in token:', tokenPayload.user_id || tokenPayload.sub || tokenPayload.uid);
                    
                    // If this is a Google token, include the Django user ID in a custom header
                    if (isGoogleAuth) {
                        const djangoUserId = localStorage.getItem('DJANGO_USER_ID');
                        console.log('Django User ID in localStorage:', djangoUserId);
                        if (djangoUserId) {
                            // Add a custom header with the Django user ID
                            config.headers['X-Django-User-ID'] = djangoUserId;
                            console.log('Added X-Django-User-ID header:', djangoUserId);
                        } else {
                            console.warn('No Django user ID found in localStorage for Google user');
                        }
                    }
                } catch (e) {
                    console.error('Error parsing token:', e);
                }
            }
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

const API_URL = import.meta.env.VITE_URL_API;

export const getWeather = async (location) => {
    try {
        const response = await axios.get(`${API_URL}/api/weather/?location=${location}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching weather:', error);
        throw error;
    }
};

export const getEvents = async (location) => {
    try {
        const response = await axios.get(`${API_URL}/api/events/?location=${location}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};

export const createTrip = async (tripData) => {
    try {
        console.log('Creating trip with data:', tripData);
        const response = await axios.post(`${API_URL}/api/trips/create_with_string_ids/`, tripData);
        return response.data;
    } catch (error) {
        console.error('Error creating trip:', error);
        if (error.response && error.response.data) {
            console.error('Error details:', error.response.data);
        }
        throw error;
    }
};

export const getTrips = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/trips/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching trips:', error);
        throw error;
    }
};

export const addActivityToTrip = async (tripId, activityId) => {
    try {
        const response = await axios.post(`${API_URL}/api/trips/${tripId}/add_activity/`, {
            activity_id: activityId
        });
        return response.data;
    } catch (error) {
        console.error('Error adding activity to trip:', error);
        throw error;
    }
};

export const inviteUserToTrip = async (tripId, userId) => {
    try {
        const response = await axios.post(`${API_URL}/api/trips/${tripId}/invite_user/`, {
            user_id: userId
        });
        return response.data;
    } catch (error) {
        console.error('Error inviting user to trip:', error);
        throw error;
    }
};

export const getProfile = async () => {
    try {
        // Check if we have the token before making the request
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            throw new Error('No authentication token found');
        }
        
        // Check if this is a Google token and we have a Django user ID
        try {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const isGoogleAuth = tokenPayload.iss && tokenPayload.iss.includes('securetoken.google.com');
            
            if (isGoogleAuth && !localStorage.getItem('DJANGO_USER_ID')) {
                console.warn('Google token detected but no Django user ID found. Attempting to retrieve it...');
                const userId = tokenPayload.sub || tokenPayload.uid;
                const email = tokenPayload.email || '';
                
                // Try to get the Django user ID from the server
                const response = await axios.post(
                    `${import.meta.env.VITE_URL_API}/api/auth/google-user/`,
                    { uid: userId, email: email }
                );
                
                if (response.data && response.data.user_id) {
                    localStorage.setItem('DJANGO_USER_ID', response.data.user_id);
                    console.log('Retrieved and stored Django user ID before profile request:', response.data.user_id);
                }
            }
        } catch (error) {
            console.error('Error checking token type:', error);
        }
        
        // Now make the profile request
        const response = await api.get('/api/profiles/me/');
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        
        // Check for 401 errors that might be due to missing Django user ID
        if (error.response && error.response.status === 401) {
            const token = localStorage.getItem(ACCESS_TOKEN);
            if (token) {
                try {
                    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                    const isGoogleAuth = tokenPayload.iss && tokenPayload.iss.includes('securetoken.google.com');
                    
                    if (isGoogleAuth) {
                        console.error('401 error with Google token - possible mapping issue');
                    }
                } catch (e) {
                    console.error('Error parsing token during error handling:', e);
                }
            }
        }
        
        throw error;
    }
};

export const followUser = async (profileId) => {
    const response = await api.post(`/api/profiles/${profileId}/follow/`);
    return response.data;
};

export const updateProfile = async (profileData) => {
    const response = await api.patch('/api/profiles/', profileData);
    return response.data;
};

export const login = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/api/token/`, credentials);
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/api/register/`, userData);
        return response.data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export const createOrGetUserFromGoogle = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/api/auth/google-user/`, userData);
        return response.data;
    } catch (error) {
        console.error('Error creating/getting user from Google auth:', error);
        if (error.response && error.response.data) {
            console.error('Error details:', error.response.data);
        }
        throw error;
    }
};

export default api