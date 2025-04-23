import React, { createContext, useState, useEffect } from "react";
import { ACCESS_TOKEN } from '../constants';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for token on component mount
    const checkAuth = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (token) {
        try {
          // Decode the JWT token to get user info
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          const userId = tokenPayload.user_id || tokenPayload.sub || tokenPayload.uid;
          
          if (userId) {
            setIsAuthenticated(true);
            setUserId(userId);
            
            // Try to get username if available
            if (tokenPayload.username) {
              setUsername(tokenPayload.username);
            }
          } else {
            // No valid user ID found in token
            logout();
          }
        } catch (error) {
          console.error('Error parsing token:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (token) => {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN, token);
      try {
        // Decode the token to get user info
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenPayload.user_id || tokenPayload.sub || tokenPayload.uid;
        
        if (userId) {
          setIsAuthenticated(true);
          setUserId(userId);
          
          // Try to get username if available
          if (tokenPayload.username) {
            setUsername(tokenPayload.username);
          }
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    setIsAuthenticated(false);
    setUserId(null);
    setUsername(null);
  };

  // Create a user in the backend if they don't exist (for Google auth)
  const ensureUserExists = async (googleUserData) => {
    try {
      // Make a request to a backend endpoint that checks if the user exists
      // and creates one if needed - you'll need to implement this endpoint
      const response = await axios.post('/api/users/ensure-exists/', googleUserData);
      return response.data;
    } catch (error) {
      console.error('Error ensuring user exists:', error);
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    userId,
    username,
    isLoading,
    login,
    logout,
    ensureUserExists
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
