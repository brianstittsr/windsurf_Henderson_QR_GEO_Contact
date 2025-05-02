import React, { createContext, useContext, useState, useEffect } from 'react';
import { LoadScript } from '@react-google-maps/api';

// Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyClSdztRAcx5_O7LSuuJEuWsNP9JZgkFKQ';

// Create a context for Google Maps
const GoogleMapsContext = createContext(null);

// Libraries to load
const libraries = ['places', 'marker'];

export function useGoogleMaps() {
  return useContext(GoogleMapsContext);
}

export function GoogleMapsProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const onLoad = () => {
    console.log('Google Maps script loaded successfully');
    setIsLoaded(true);
  };

  const onError = (error) => {
    console.error('Error loading Google Maps script:', error);
    setLoadError(error);
  };

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      <LoadScript
        id="google-maps-script"
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        libraries={libraries}
        onLoad={onLoad}
        onError={onError}
      >
        {children}
      </LoadScript>
    </GoogleMapsContext.Provider>
  );
}
