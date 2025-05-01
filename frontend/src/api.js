import axios from "axios"
import { ACCESS_TOKEN } from "./constants"

//baseURL: import.meta.env.VITE_URL_API
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

// const API_URL = import.meta.env.VITE_URL_API;
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

export const generateTrip = async (tripData) => {
    try {
        console.log('Creating trip with data:', tripData);
        
        // Step 1: Create the trip by posting the data
        const createResponse = await axios.post(`${API_URL}/api/trips/create_with_string_ids/`, tripData);
        
        // Step 2: Check if trip creation was successful
        if (createResponse.status === 201) {
            const tripId = createResponse.data.id; // assuming the response contains the trip's ID
            
            console.log('Trip created successfully:', createResponse.data);
            
            // Step 3: Generate the itinerary using the created trip's ID
            const itineraryResponse = await axios.post(`${API_URL}/api/trips/${tripId}/generate_itinerary/`, {
                trip_id: tripId,  // Pass the trip ID to the generate_itinerary endpoint
            });
            
            console.log('Itinerary generated successfully:', itineraryResponse.data);
            return itineraryResponse.data;
        } else {
            throw new Error('Trip creation failed');
        }
    } catch (error) {
        console.error('Error creating trip or generating itinerary:', error);
        if (error.response && error.response.data) {
            console.error('Error details:', error.response.data);
        }
        throw error;
    }
}


export const createTrip = async (tripData) => {
    try {
        console.log('Creating trip with data:', tripData);
        const response = await axios.post(`${API_URL}/api/trips/`, tripData);
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
        const response = await api.get('/api/profiles/me/');
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
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