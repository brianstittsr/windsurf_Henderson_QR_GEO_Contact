import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { GoogleMap, LoadScript, OverlayView } from '@react-google-maps/api';

// Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyClSdztRAcx5_O7LSuuJEuWsNP9JZgkFKQ';

// Map container style
const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
};

// Henderson, NC center coordinates
const center = {
  lat: 36.3296,
  lng: -78.4186
};

// Test locations
const testLocations = [
  {
    id: 1,
    name: "First National Bank Building",
    position: { lat: 36.326337, lng: -78.403765 }
  },
  {
    id: 2,
    name: "Henderson City Hall",
    position: { lat: 36.3305, lng: -78.4175 }
  },
  {
    id: 3,
    name: "Test Location 3",
    position: { lat: 36.3320, lng: -78.4150 }
  }
];

export default function MapTestPage() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  return (
    <Layout title="Map Test Page">
      <h1 className="mb-4">Map Test Page</h1>
      <p className="mb-4">This is a simple test page to verify that Google Maps and markers are working correctly.</p>
      
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="card-title">Test Map</h2>
          <div className="alert alert-info mb-3">
            <strong>Status:</strong> Script loaded: {scriptLoaded ? 'Yes' : 'No'}, Map loaded: {mapLoaded ? 'Yes' : 'No'}
          </div>
          
          <LoadScript 
            googleMapsApiKey={GOOGLE_MAPS_API_KEY} 
            onLoad={() => {
              console.log('Google Maps script loaded successfully');
              setScriptLoaded(true);
              if (window.google) {
                console.log('Google Maps API is available in window.google');
              } else {
                console.error('Google Maps API is NOT available in window.google');
              }
            }} 
            onError={(error) => console.error('Error loading Google Maps script:', error)}
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={14}
              options={{
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true
              }}
              onLoad={(map) => {
                console.log('Map component loaded successfully');
                setMapLoaded(true);
                // Force a re-render of markers by slightly moving the map
                setTimeout(() => {
                  if (map) {
                    const currentCenter = map.getCenter();
                    map.panTo({
                      lat: currentCenter.lat() + 0.0001,
                      lng: currentCenter.lng() + 0.0001
                    });
                    console.log('Forced map refresh to render markers');
                  }
                }, 500);
              }}
              onError={(error) => console.error('Error loading map:', error)}
            >
              {/* City Center Marker */}
              <OverlayView
                position={center}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                getPixelPositionOffset={(width, height) => ({
                  x: -(width / 2),
                  y: -height
                })}
              >
                <div 
                  className="position-relative"
                  style={{ cursor: 'pointer' }}
                  title="Henderson, NC"
                >
                  <FontAwesomeIcon 
                    icon={faLocationDot} 
                    size="2x" 
                    className="text-primary" 
                    style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.3))' }}
                  />
                </div>
              </OverlayView>
              
              {/* Test Location Markers */}
              {testLocations.map((location) => (
                <OverlayView
                  key={location.id}
                  position={location.position}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  getPixelPositionOffset={(width, height) => ({
                    x: -(width / 2),
                    y: -height
                  })}
                >
                  <div 
                    className="position-relative"
                    style={{ cursor: 'pointer' }}
                    title={location.name}
                  >
                    <FontAwesomeIcon 
                      icon={faLocationDot} 
                      size="2x" 
                      className="text-danger" 
                      style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.3))' }}
                    />
                  </div>
                </OverlayView>
              ))}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>
      
      <div className="card">
        <div className="card-body">
          <h2 className="card-title">Test Locations</h2>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Latitude</th>
                <th>Longitude</th>
              </tr>
            </thead>
            <tbody>
              {testLocations.map((location) => (
                <tr key={location.id}>
                  <td>{location.id}</td>
                  <td>{location.name}</td>
                  <td>{location.position.lat}</td>
                  <td>{location.position.lng}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
