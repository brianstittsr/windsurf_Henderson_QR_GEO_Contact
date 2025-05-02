import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faInfoCircle, 
  faMapMarkerAlt,
  faLocationDot
} from '@fortawesome/free-solid-svg-icons';
import { GoogleMap, InfoWindow } from '@react-google-maps/api';
import FontAwesomeMarker from '../components/FontAwesomeMarker';

// Debug flag to show console logs
const DEBUG = true;

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

export default function GeocodePage() {
  const [address, setAddress] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [googleMapsReady, setGoogleMapsReady] = useState(false);

  // Fallback location data in case API fails
  const fallbackLocationData = {
    results: [
      {
        formatted_address: "213-215 S Garnett St, Henderson, NC 27536, USA",
        geometry: {
          location: {
            lat: 36.326337,
            lng: -78.403765
          }
        },
        facility_name: "First National Bank Building",
        place_id: "ChIJN87riHCFreIRb8VKl5u7KAs"
      }
    ]
  };
  
  // Fetch locations and check if Google Maps API is loaded
  useEffect(() => {
    // Initialize with fallback data
    setLocations(fallbackLocationData.results);
    
    // Check if Google Maps API is loaded
    const checkGoogleMapsLoaded = () => {
      if (window.google && window.google.maps) {
        setGoogleMapsReady(true);
      } else {
        setTimeout(checkGoogleMapsLoaded, 100);
      }
    };
    
    // Start checking if we're in browser environment
    if (typeof window !== 'undefined') {
      checkGoogleMapsLoaded();
    }
    
    // Fetch locations from API
    async function fetchLocations() {
      try {
        console.log('Fetching locations...');
        const response = await fetch('/api/locations');
        
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Locations data:', data);
        
        if (data.results && data.results.length > 0) {
          console.log(`Found ${data.results.length} locations`);
          
          // Make sure each location has the required geometry.location structure
          const validLocations = data.results.filter(location => {
            if (!location.geometry || !location.geometry.location) return false;
            if (typeof location.geometry.location.lat !== 'number' && 
                typeof location.geometry.location.lat !== 'string') return false;
            if (typeof location.geometry.location.lng !== 'number' && 
                typeof location.geometry.location.lng !== 'string') return false;
            return true;
          });
          
          if (validLocations.length > 0) {
            setLocations(validLocations);
          } else {
            console.warn('No valid locations found in API response, using fallback data');
            setLocations(fallbackLocationData.results);
          }
        } else {
          console.warn('No locations found in data, using fallback data');
          setLocations(fallbackLocationData.results);
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError(`Failed to load locations: ${err.message}`);
        setLocations(fallbackLocationData.results);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLocations();
  }, []);
  
  return (
    <Layout title="Henderson Geocode Demo">
      <Link href="/" className="back-link">
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
      </Link>
      
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="card-title">Henderson, North Carolina</h2>
          <p className="card-text">
            This map is centered on Henderson, North Carolina. Henderson is a city in Vance County, North Carolina, 
            with a population of approximately 15,000 people. It is located about 40 miles north of Raleigh.
          </p>
          <p className="card-text">
            <strong>Coordinates:</strong> Latitude 36.3296° N, Longitude 78.4186° W
          </p>
          <div className="alert alert-info">
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
            The map displays placemarkers loaded from the data.json file. Click on any marker to view detailed information.
          </div>
          <div>
            <span className="badge bg-primary me-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" /> Blue Marker: City Center
            </span>
            <span className="badge bg-danger">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" /> Red Markers: Points of Interest
            </span>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
          {error}
        </div>
      ) : (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={13}
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
          {/* City Center Marker - FontAwesome Marker */}
          <FontAwesomeMarker
            position={center}
            icon={faLocationDot}
            color="primary"
            size="2x"
            title="Henderson, NC"
            label="H"
          />
          
          {/* Location Markers */}
          {locations.map((location, index) => {
            // Ensure location has valid coordinates
            if (!location.geometry || !location.geometry.location) {
              console.warn(`Location at index ${index} missing geometry.location`);
              return null;
            }
            
            // Convert string coordinates to numbers if needed
            const position = {
              lat: typeof location.geometry.location.lat === 'number' 
                ? location.geometry.location.lat 
                : parseFloat(location.geometry.location.lat),
              lng: typeof location.geometry.location.lng === 'number' 
                ? location.geometry.location.lng 
                : parseFloat(location.geometry.location.lng)
            };
            
            // Skip invalid coordinates
            if (isNaN(position.lat) || isNaN(position.lng)) {
              console.warn(`Invalid coordinates for location at index ${index}`);
              return null;
            }
            
            console.log(`Rendering marker ${index} at position:`, position);
            return (
              <FontAwesomeMarker
                key={location.place_id || index}
                position={position}
                icon={faLocationDot}
                color="danger"
                size="2x"
                title={location.facility_name || location.formatted_address}
                onClick={() => setSelectedLocation(location)}
                label={`${index + 1}`}
              />
            );
          })}
            
            {/* Info Window for Selected Location */}
            {selectedLocation && (
              <InfoWindow
                position={selectedLocation.geometry.location}
                onCloseClick={() => setSelectedLocation(null)}
              >
                <div className="info-window" style={{ padding: '5px', maxWidth: '300px' }}>
                  <h5 style={{ marginTop: 0, marginBottom: '10px', fontSize: '16px' }}>
                    {selectedLocation.facility_name ? (
                      <Link 
                        href={`/facility/${selectedLocation.place_id}`}
                        style={{ color: '#4285F4', textDecoration: 'none' }}
                        target="_blank"
                      >
                        {selectedLocation.facility_name}
                      </Link>
                    ) : (
                      selectedLocation.formatted_address
                    )}
                  </h5>
                  <p style={{ marginBottom: '5px', fontSize: '13px' }}>
                    <strong>Address:</strong> {selectedLocation.formatted_address}
                  </p>
                  <p style={{ marginBottom: '5px', fontSize: '13px' }}>
                    <strong>Place ID:</strong> {selectedLocation.place_id}
                  </p>
                  <p style={{ marginBottom: '5px', fontSize: '13px' }}>
                    <strong>Location:</strong> {selectedLocation.geometry.location.lat.toFixed(6)}, {selectedLocation.geometry.location.lng.toFixed(6)}
                  </p>
                  
                  {selectedLocation.types && selectedLocation.types.length > 0 && (
                    <p style={{ marginBottom: '5px', fontSize: '13px' }}>
                      <strong>Types:</strong> {selectedLocation.types.join(', ')}
                    </p>
                  )}
                  
                  {selectedLocation.historical_info && (
                    <div style={{ marginTop: '10px', paddingTop: '5px', borderTop: '1px solid #eee' }}>
                      <h6 style={{ marginTop: '15px', marginBottom: '8px', color: '#34a853', fontSize: '14px' }}>
                        Historical Information
                      </h6>
                      <p style={{ marginBottom: '5px', fontSize: '13px' }}>
                        <strong>Year Built:</strong> {selectedLocation.historical_info.year_built}
                      </p>
                      <p style={{ marginBottom: '5px', fontSize: '13px' }}>
                        <strong>Style:</strong> {selectedLocation.historical_info.architectural_style}
                      </p>
                      <p style={{ marginBottom: '5px', fontSize: '13px' }}>
                        <strong>Significance:</strong> {selectedLocation.historical_info.historical_significance}
                      </p>
                    </div>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
      )}
    </Layout>
  );
}
