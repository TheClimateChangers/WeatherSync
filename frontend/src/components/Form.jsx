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
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        setLoading(true);
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
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
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
            alert("Google login failed");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>
            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            {loading && <LoadingIndicator />}
            <button className="form-button" type="submit">
                {name}
            </button>
            <button className="form-button" type="button" onClick={handleGoogleLogin}>
                {name} with Google
            </button>
        </form>
    );
}

export default Form
