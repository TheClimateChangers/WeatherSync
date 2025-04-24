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

export const getTripById = async (tripId) => {
    try {
      const response = await api.get(`/api/trips/${tripId}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching trip:", error);
      throw error;
    }
  };
  
export default api