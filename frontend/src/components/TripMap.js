import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import axios from "axios";

const mapContainerStyle = {
  height: "400px",
  width: "100%",
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

const TripMap = () => {
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState("");

  const fetchCoordinates = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/get-coordinates?city=${city}`);
      setLocation(response.data);
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
  };

  return (
    <div>
      <input 
        type="text" 
        placeholder="Enter city name" 
        value={city} 
        onChange={(e) => setCity(e.target.value)} 
      />
      <button onClick={fetchCoordinates}>Get Coordinates</button>
      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
        <GoogleMap 
          mapContainerStyle={mapContainerStyle} 
          center={location ? { lat: location.latitude, lng: location.longitude } : defaultCenter} 
          zoom={location ? 10 : 5}
        >
          {location && <Marker position={{ lat: location.latitude, lng: location.longitude }} />}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default TripMap;
