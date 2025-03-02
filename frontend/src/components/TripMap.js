import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";


const mapContainerStyle = {
  height: "400px",
  width: "100%",
};


const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
};


const TripMap = () => {
  const locations = [
    { name: "San Francisco", lat: 37.7749, lng: -122.4194 },
    { name: "New York", lat: 40.7128, lng: -74.0060 },
    { name: "Los Angeles", lat: 34.0522, lng: -118.2437 }
  ];


  return (
    <LoadScript googleMapsApiKey="AIzaSyBEPK0j_w8O5TABTnV62Cjv-IpJ3ISDqrk">
      <GoogleMap mapContainerStyle={mapContainerStyle} center={defaultCenter} zoom={5}>
        {locations.map((loc, index) => (
          <Marker key={index} position={{ lat: loc.lat, lng: loc.lng }} />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};


export default TripMap;