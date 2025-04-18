import axios from "axios"
import { ACCESS_TOKEN } from "./constants"

const api = axios.create({
    baseURL: import.meta.env.VITE_URL_API
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
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
        const response = await axios.post(`${API_URL}/api/trips/`, tripData);
        return response.data;
    } catch (error) {
        console.error('Error creating trip:', error);
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

export const getProfile = async (username) => {
    const endpoint = username === 'me' ? '/profiles/me/' : `/profiles/${username}/`;
    const response = await api.get(endpoint);
    return response.data;
};

export const followUser = async (profileId) => {
    const response = await api.post(`/profiles/${profileId}/follow/`);
    return response.data;
};

export const updateProfile = async (profileData) => {
    const response = await api.patch('/profiles/me/', profileData);
    return response.data;
};

export default api