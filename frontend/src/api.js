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

export const getWeather = async (location) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_URL_API}/weather/?location=${location}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching weather:', error);
        throw error;
    }
};

export const getEvents = async (location) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_URL_API}/events/?location=${location}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};

export const createTrip = async (tripData) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_URL_API}/trips/`, tripData);
        return response.data;
    } catch (error) {
        console.error('Error creating trip:', error);
        throw error;
    }
};

export const getTrips = async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_URL_API}/trips/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching trips:', error);
        throw error;
    }
};

export const addActivityToTrip = async (tripId, activityId) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_URL_API}/trips/${tripId}/add_activity/`, {
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
        const response = await axios.post(`${import.meta.env.VITE_URL_API}/trips/${tripId}/invite_user/`, {
            user_id: userId
        });
        return response.data;
    } catch (error) {
        console.error('Error inviting user to trip:', error);
        throw error;
    }
};

export default api