import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Plan from './pages/Plan';
import Trips from './pages/Trips';
import Profile from './pages/Profile';
import CustomPlan from './pages/CustomPlan';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout'; //  fixed casing
import { ACCESS_TOKEN } from './constants';

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

// Protected route wrapper
function Protected({ children }) {
  const token = localStorage.getItem(ACCESS_TOKEN);
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<RegisterAndLogout />} />
          <Route path="logout" element={<Logout />} />
          <Route path="plan" element={<Plan />} />
          <Route path="profile" element={
            <Protected>
              <Profile />
            </Protected>
          } />
          <Route path="trips" element={<Trips />} />
          <Route path="custom-trip" element={<CustomPlan />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
