import React, { useContext } from 'react'
import { useState } from "react";
import { login as apiLogin, register as apiRegister, exchangeFirebaseToken } from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css"
import LoadingIndicator from "./LoadingIndicator";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { AuthContext } from './AuthContext';

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
        } catch (error) {
            console.error("Error:", error);
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error("Response data:", error.response.data);
                if (typeof error.response.data === 'object') {
                    const errorMessages = [];
                    for (const key in error.response.data) {
                        errorMessages.push(`${key}: ${error.response.data[key]}`);
                    }
                    setError(errorMessages.join(', '));
                } else {
                    setError(error.response.data || "An error occurred");
                }
            } else if (error.request) {
                // The request was made but no response was received
                setError("No response from server. Please try again later.");
            } else {
                // Something happened in setting up the request that triggered an Error
                setError(error.message || "An unexpected error occurred");
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
            
            // Exchange Firebase token for a Django JWT token
            const tokenData = await exchangeFirebaseToken(firebaseToken);
            console.log("Token exchange response:", tokenData);
            
            if (!tokenData || !tokenData.access) {
                throw new Error("Failed to get Django JWT token");
            }
            
            // Store the Django JWT token for authentication
            localStorage.setItem(ACCESS_TOKEN, tokenData.access);
            
            // Store the refresh token if present
            if (tokenData.refresh) {
                localStorage.setItem(REFRESH_TOKEN, tokenData.refresh);
            }
            
            // Store the Django user ID
            localStorage.setItem('DJANGO_USER_ID', tokenData.user_id);
            
            // Log the values for debugging
            console.log("Stored ACCESS_TOKEN:", tokenData.access.substring(0, 20) + '...');
            console.log("Stored DJANGO_USER_ID:", tokenData.user_id);
            
            login(tokenData.access);
            navigate("/");
        } catch (error) {
            console.error("Google login error:", error);
            setError("Google login failed: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>
            {error && <div className="error-message">{error}</div>}
            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            {loading && <LoadingIndicator />}
            <button className="form-button" type="submit" disabled={loading}>
                {name}
            </button>
            <button className="form-button" type="button" onClick={handleGoogleLogin} disabled={loading}>
                {name} with Google
            </button>
        </form>
    );
}

export default Form
