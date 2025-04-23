import React, { useContext } from 'react'
import { useState } from "react";
import { login as apiLogin, register as apiRegister } from "../api";
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
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' })
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const accessToken = await user.getIdToken();
            // Handle the authenticated user data
            console.log(user);
            // Optionally send user data to your server
            localStorage.setItem(ACCESS_TOKEN, user.accessToken);
            login(accessToken);
            navigate("/");
        } catch (error) {
            console.error(error);
            setError("Google login failed: " + error.message);
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
