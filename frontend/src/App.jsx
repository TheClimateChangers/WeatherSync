// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout"; // ✅ fixed casing

// Logs out then shows Register
function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

// Logs out and redirects
function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* ✅ Unprotected Home now at /home */}
          <Route path="home" element={<Home />} />

          {/* Auth routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<RegisterAndLogout />} />
          <Route path="logout" element={<Logout />} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
