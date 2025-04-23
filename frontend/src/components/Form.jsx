import React, { useContext } from 'react'
import { useState } from "react";
import { login as apiLogin, register as apiRegister, createOrGetUserFromGoogle } from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css"
import LoadingIndicator from "./LoadingIndicator";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { AuthContext } from './AuthContext';
import { initializeApp } from "firebase/app";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAQnYDLVEYEDjl0N5ZPqUbPJ3ZlSGG5t10",
    authDomain: "tripsync-80368.firebaseapp.com",
    projectId: "tripsync-80368",
    storageBucket: "tripsync-80368.appspot.com",
    messagingSenderId: "1051696018872",
    appId: "1:1051696018872:web:74a8f981d08fadf8a1ed5c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        setLoading(true);
        setError("");
        e.preventDefault();

        try {
            if (method === "login") {
                const data = await apiLogin({ username, password });
                localStorage.setItem(ACCESS_TOKEN, data.access);
                localStorage.setItem(REFRESH_TOKEN, data.refresh);
                
                // Extract and save the user ID from the token for Django users
                try {
                    const tokenPayload = JSON.parse(atob(data.access.split('.')[1]));
                    if (tokenPayload.user_id) {
                        localStorage.setItem('DJANGO_USER_ID', tokenPayload.user_id);
                        console.log('Stored Django user ID:', tokenPayload.user_id);
                    }
                } catch (error) {
                    console.error('Error parsing Django token:', error);
                }
                
                console.log('Token stored', data.access);
                login(data.access);
                navigate("/");
            } else {
                await apiRegister({ username, password });
                navigate("/login");
            }
        } catch (err) {
            console.error("Form submission error:", err);
            if (err.response && err.response.data) {
                if (err.response.data.username) {
                    setError(err.response.data.username[0]);
                } else if (err.response.data.password) {
                    setError(err.response.data.password[0]);
                } else if (err.response.data.detail) {
                    setError(err.response.data.detail);
                } else {
                    setError("An error occurred. Please try again.");
                }
            } else {
                setError("Network error. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        setLoading(true);
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' })
        try {
            // Authenticate with Firebase
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const firebaseToken = await user.getIdToken();
            
            console.log("Google user:", user);
            
            // Create or get a Django user for this Google user
            const userData = {
                uid: user.uid,
                name: user.displayName || '',
                email: user.email || ''
            };
            
            // Send the Google user data to your Django backend
            const djangoUserResponse = await createOrGetUserFromGoogle(userData);
            console.log("Django user created/found:", djangoUserResponse);
            
            if (!djangoUserResponse || !djangoUserResponse.user_id) {
                throw new Error("Failed to create or retrieve Django user ID");
            }
            
            // Store the Firebase token for authentication
            localStorage.setItem(ACCESS_TOKEN, firebaseToken);
            
            // Store the Django user ID for creating trips
            localStorage.setItem('DJANGO_USER_ID', djangoUserResponse.user_id);
            
            // Log the values for debugging
            console.log("Stored ACCESS_TOKEN:", firebaseToken.substring(0, 20) + "...");
            console.log("Stored DJANGO_USER_ID:", djangoUserResponse.user_id);
            
            login(firebaseToken);
            navigate("/");
        } catch (error) {
            console.error("Google login error:", error);
            setError("Google login failed: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-inner">
                <h1 className="form-title">{name}</h1>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? "Processing..." : name}
                    </button>
                </form>
                
                {method === "login" && (
                    <div className="google-login">
                        <div className="divider">
                            <span>OR</span>
                        </div>
                        <button 
                            onClick={handleGoogleLogin} 
                            className="google-button"
                            disabled={loading}
                        >
                            <i className="fab fa-google"></i>
                            {loading ? "Processing..." : "Login with Google"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Form
