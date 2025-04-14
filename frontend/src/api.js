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
    const response = await axios.get(`${import.meta.env.VITE_URL_API}/api/weather/`, {
        params: { location }
    });
    return response.data;
};

export const getForecast = async (location, days = 5) => {
    const response = await axios.get(`${import.meta.env.VITE_URL_API}/api/weather/forecast/`, {
        params: { location, days }
    });
    return response.data;
};

export const getActivities = async (location) => {
    const response = await axios.get(`${import.meta.env.VITE_URL_API}/api/activities/`, {
        params: { location }
    });
    return response.data;
};

export default api