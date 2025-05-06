import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const geocodeAddress = async (address) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status === "OK") {
    const loc = data.results[0].geometry.location;
    return { lat: loc.lat, lng: loc.lng };
  }
  return null;
};

const extractCityState = (locationStr) => {
  const parts = locationStr.split(',').map((s) => s.trim());
  return parts.length >= 2 ? { city: parts[0], state: parts[1] } : { city: null, state: null };
};

const MapView = ({ activities }) => {
  const [markers, setMarkers] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    console.log("[MAPVIEW] Activities received:", activities);

    const loadCoordinates = async () => {
      const results = await Promise.all(
        activities.map(async (activityWrapper) => {
          const activity = activityWrapper.activity;
          if (!activity) return null;

          console.log("[MAPVIEW] Activity:", activity);
          if (activity.latitude && activity.longitude) {
            return {
              ...activityWrapper,
              lat: activity.latitude,
              lng: activity.longitude,
              name: activity.name,
              image_url: activity.image_url,
            };
          } else if (activity.address) {
            const { city, state } = extractCityState(activity.location || "");
            const formattedAddress = `${activity.address}, ${city}, ${state}`;
            const coords = await geocodeAddress(formattedAddress);
            return coords
              ? {
                  ...activityWrapper,
                  ...coords,
                  name: activity.name,
                  image_url: activity.image_url,
                }
              : null;
          }

          return null;
        })
      );
      setMarkers(results.filter(Boolean));
    };

    loadCoordinates();
  }, [activities]);

  const center = markers.length
    ? { lat: markers[0].lat, lng: markers[0].lng }
    : { lat: 37.7749, lng: -122.4194 };

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={{ lat: marker.lat, lng: marker.lng }}
          title={marker.name}
          onClick={() => setSelectedActivity(marker)}
        />
      ))}

      {selectedActivity && (
        <InfoWindow
          position={{ lat: selectedActivity.lat, lng: selectedActivity.lng }}
          onCloseClick={() => setSelectedActivity(null)}
        >
          <div style={{ width: "200px" }}>
            {selectedActivity.image_url && (
              <img
              src={selectedActivity.image_url}
              alt={selectedActivity.name}
              style={{ width: "75%", borderRadius: "2px", marginTop: "2px" }}
              />
            )}
            <h3>{selectedActivity.name}</h3>
            <p>{selectedActivity.activity?.address || "No address provided"}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MapView;
