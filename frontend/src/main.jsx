import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import '.././index.css';
import { AuthProvider } from './components/AuthContext.jsx';
import { LoadScript } from '@react-google-maps/api';

const GOOGLE_MAP_LIBRARIES = ['places'];

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        libraries={GOOGLE_MAP_LIBRARIES}
      >
        <App />
      </LoadScript>
    </AuthProvider>
  </StrictMode>
);
