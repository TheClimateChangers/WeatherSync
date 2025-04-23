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
            
            // Simple debug logging for profile request
            if (config.url && config.url.includes('/api/profiles/me/')) {
                console.log('Making authenticated request to profile endpoint');
                console.log('Authorization header set with token:', token.substring(0, 15) + '...');
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
        
        console.log('Token from localStorage:', token.substring(0, 20) + '...');
        
        // Make the profile request - no need for query parameters since we have a Django JWT token
        const response = await api.get('/api/profiles/me/');
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        
        // Check for 401 errors that might be due to expired token
        if (error.response && error.response.status === 401) {
            console.error('Error response data:', error.response.data);
            console.error('Unauthorized error - token may have expired');
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

export const exchangeFirebaseToken = async (token) => {
    try {
        console.log('Exchanging Firebase token for Django JWT token');
        const response = await axios.post(`${API_URL}/api/auth/exchange-firebase-token/`, {
            token: token
        });
        return response.data;
    } catch (error) {
        console.error('Error exchanging Firebase token:', error);
        if (error.response && error.response.data) {
            console.error('Error details:', error.response.data);
        }
        throw error;
    }
};

export default api