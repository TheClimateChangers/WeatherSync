import React, { createContext, useState, useEffect } from "react";
import { ACCESS_TOKEN } from '../constants';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authType, setAuthType] = useState(null); // 'google' or 'django'

  useEffect(() => {
    // Check for token on component mount
    const checkAuth = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (token) {
        try {
          // Decode the JWT token to get user info
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          const userId = tokenPayload.user_id || tokenPayload.sub || tokenPayload.uid;
          
          // Determine if this is a Google auth token
          const isGoogleAuth = tokenPayload.iss && tokenPayload.iss.includes('securetoken.google.com');
          setAuthType(isGoogleAuth ? 'google' : 'django');
          
          if (userId) {
            setIsAuthenticated(true);
            setUserId(userId);
            
            // For Google auth, check if we have the Django user ID
            if (isGoogleAuth) {
              const djangoUserId = localStorage.getItem('DJANGO_USER_ID');
              if (!djangoUserId) {
                console.warn('Google authentication detected, but no Django user ID found');
              }
            } else {
              // For Django auth, ensure the user_id is saved to localStorage
              if (tokenPayload.user_id) {
                localStorage.setItem('DJANGO_USER_ID', tokenPayload.user_id);
                console.log('Stored Django user ID from auth context:', tokenPayload.user_id);
              }
            }
            
            // Try to get username if available
            if (tokenPayload.username) {
              setUsername(tokenPayload.username);
            } else if (tokenPayload.email) {
              // Use email as fallback for display name
              setUsername(tokenPayload.email.split('@')[0]);
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
        
        // Determine if this is a Google auth token
        const isGoogleAuth = tokenPayload.iss && tokenPayload.iss.includes('securetoken.google.com');
        setAuthType(isGoogleAuth ? 'google' : 'django');
        
        if (userId) {
          setIsAuthenticated(true);
          setUserId(userId);
          
          // For Django auth, ensure we store the user_id
          if (!isGoogleAuth && tokenPayload.user_id) {
            localStorage.setItem('DJANGO_USER_ID', tokenPayload.user_id);
            console.log('Stored Django user ID from login:', tokenPayload.user_id);
          }
          
          // Try to get username if available
          if (tokenPayload.username) {
            setUsername(tokenPayload.username);
          } else if (tokenPayload.email) {
            // Use email as fallback for display name
            setUsername(tokenPayload.email.split('@')[0]);
          }
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem('DJANGO_USER_ID');
    setIsAuthenticated(false);
    setUserId(null);
    setUsername(null);
    setAuthType(null);
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

  // Get information about current authentication
  const getAuthInfo = () => {
    return {
      isAuthenticated,
      userId,
      username,
      authType,
      hasBackendUserId: !!localStorage.getItem('DJANGO_USER_ID')
    };
  };

  const value = {
    isAuthenticated,
    userId,
    username,
    authType,
    isLoading,
    login,
    logout,
    ensureUserExists,
    getAuthInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
