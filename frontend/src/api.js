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

// const API_URL = "http://127.0.0.1:8000";
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
            const itineraryResponse = await axios.post(`${API_URL}/api/trips/${tripId}/generate_itinerary/`, tripData);

            
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

export const addActivityToTrip = async (tripId, activity_id, time_slot, date) => {
    try {
        const response = await axios.post(`${API_URL}/api/trips/${tripId}/add_activity/`, {
            activity_id: activity_id, time_slot,
            time_slot: time_slot,
            date: date
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
    const response = await api.patch('/api/profiles/me/', profileData);
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

export const getTripById = async (tripId) => {
    const response = await fetch(`${import.meta.env.VITE_URL_API}/api/trips/${tripId}/`);
    if (!response.ok) {
      throw new Error('Failed to fetch trip.');
    }
    return await response.json();
};

  
  export const getYelpActivities = async (location) => {
    try {
      const response = await api.get(`/api/yelp-activities/?location=${encodeURIComponent(location)}&categories=active`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch Yelp activities:', error);
      throw error;
    }
  };

  export const addNextTripDay = async (tripId) => {
    try {
      const response = await axios.post(`${API_URL}/api/trips/${tripId}/add-day/`);
      return response.data; // New day's data
    } catch (error) {
      console.error('Error adding next trip day:', error.response?.data?.error || error.message);
      throw error;
    }
  };
  
  export const deleteTripDay = async (tripId, dayId) => {
    try {
      const response = await axios.delete(`${API_URL}/api/trips/${tripId}/days/${dayId}/delete/`);
      return response.data; // Success message
    } catch (error) {
      console.error('Error deleting trip day:', error.response?.data?.error || error.message);
      throw error;
    }
  };

  export const deleteTrip = async (tripId) => {
    try {
      const response = await axios.delete(`${API_URL}/api/trips/${tripId}/delete/`);
      return response.data; // Success message
    } catch (error) {
      console.error('Error deleting trip:', error.response?.data?.error || error.message);
      throw error;
    }
  };

  export const deleteActivity = async (tripId, activityId) => {
    try {
      const response = await axios.delete(`${API_URL}/api/activities/${activityId}/delete/`);
      return response.data; // Success message
    } catch (error) {
      console.error('Error deleting activity:', error.response?.data?.error || error.message);
      throw error;
    }
  };

  export const getActivities = async (data) => {
    try {
        const { location, categories, limit=10, offset=0 } = data;

        const response = await axios.get(`${API_URL}/api/yelp-activities/`, {
            params: {
                location: location,
                categories: encodeURIComponent(categories),
                limit: limit,
                offset: offset
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching activities:', error);
        throw error;
    }
  };

  export const createActivity = async (activityData) => {
    try {
        const response = await axios.post(`${API_URL}/api/activities/`, activityData);
        return response.data;
    } catch (error) {
        console.error('Error creating activity:', error);
        throw error;
    }
  };
//trip_days/<int:tripDayId>/add-activity/
  export const addActivityToTripDay = async (trip_day_id, activity_id, time_slot) => {
    try {
        const response = await axios.post(`${API_URL}/api/trip_days/${trip_day_id}/add_activity/`, {
            activity_id: activity_id,
            time_slot: time_slot,
        });
        return response.data;
    } catch (error) {
        console.error('Error adding activity to trip:', error);
        throw error;
    }
  };
  
export default api