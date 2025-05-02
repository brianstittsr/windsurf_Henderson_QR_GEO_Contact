import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faInfoCircle, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { GoogleMap } from '@react-google-maps/api';
import FontAwesomeMarker from '../../components/FontAwesomeMarker';

// Debug flag to show console logs
const DEBUG = true;

// Map container style
const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px',
  marginBottom: '1.5rem'
};

export default function FacilityDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [googleMapsReady, setGoogleMapsReady] = useState(false);
  
  useEffect(() => {
    // Only fetch data when id is available (after hydration)
    if (!id) return;
    
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
    
    async function fetchFacilityData() {
      try {
        const response = await fetch('/api/locations');
        const data = await response.json();
        
        // Find the facility with the matching ID
        const matchingFacility = data.results.find(item => item.place_id === id);
        
        if (!matchingFacility) {
          setError('Facility not found');
        } else {
          setFacility(matchingFacility);
        }
      } catch (err) {
        console.error('Error fetching facility data:', err);
        setError('Failed to load facility data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchFacilityData();
  }, [id]);
  
  if (loading) {
    return (
      <Layout title="Loading Facility Details...">
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error || !facility) {
    return (
      <Layout title="Facility Not Found">
        <Link href="/map" className="back-link">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Map
        </Link>
        
        <div className="alert alert-danger">
          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
          {error || 'Facility not found'}
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title={facility.facility_name || 'Facility Detail'}>
      <Link href="/map" className="back-link">
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Map
      </Link>
      
      <div className="row">
        <div className="col-md-8">
          {/* Facility Information Section */}
          <div className="form-section">
            <h3>About the Facility</h3>
            <p><strong>Address:</strong> {facility.formatted_address}</p>
            <p><strong>Coordinates:</strong> {facility.geometry.location.lat.toFixed(6)}, {facility.geometry.location.lng.toFixed(6)}</p>
            
            {facility.types && facility.types.length > 0 && (
              <div className="mb-3">
                <strong>Types:</strong>{' '}
                {facility.types.map((type, index) => (
                  <span key={index} className="badge bg-secondary me-1">{type}</span>
                ))}
              </div>
            )}
            
            {facility.historical_info && (
              <div className="mt-4">
                <h4>Historical Information</h4>
                {facility.historical_info.year_built && (
                  <p><strong>Year Built:</strong> {facility.historical_info.year_built}</p>
                )}
                {facility.historical_info.architectural_style && (
                  <p><strong>Architectural Style:</strong> {facility.historical_info.architectural_style}</p>
                )}
                {facility.historical_info.historical_significance && (
                  <p><strong>Historical Significance:</strong> {facility.historical_info.historical_significance}</p>
                )}
                {facility.historical_info.current_status && (
                  <p><strong>Current Status:</strong> {facility.historical_info.current_status}</p>
                )}
                
                {facility.historical_info.architects && facility.historical_info.architects.length > 0 && (
                  <>
                    <h5 className="mt-3">Architects</h5>
                    {facility.historical_info.architects.map((architect, index) => (
                      <div key={index} className="card mb-2">
                        <div className="card-body">
                          <h6 className="card-title">{architect.name}</h6>
                          {architect.lifespan && (
                            <p className="card-text"><strong>Lifespan:</strong> {architect.lifespan}</p>
                          )}
                          {architect.firm && (
                            <p className="card-text"><strong>Firm:</strong> {architect.firm}</p>
                          )}
                          {architect.role && (
                            <p className="card-text"><strong>Role:</strong> {architect.role}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
                
                {facility.historical_info.listed_in_inventories && facility.historical_info.listed_in_inventories.length > 0 && (
                  <>
                    <h5 className="mt-3">Listed In</h5>
                    <ul>
                      {facility.historical_info.listed_in_inventories.map((inv, index) => (
                        <li key={index}>{inv}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Wikipedia Information Section */}
          {facility.wikipedia_info && (
            <div className="form-section">
              <h3>Wikipedia Information</h3>
              
              {facility.wikipedia_info.architects && Object.keys(facility.wikipedia_info.architects).length > 0 && (
                <>
                  <h4>About the Architects</h4>
                  {Object.entries(facility.wikipedia_info.architects).map(([key, value], index) => (
                    <p key={index}>{value}</p>
                  ))}
                </>
              )}
              
              {facility.wikipedia_info.building_context && (
                <>
                  <h4 className="mt-4">Building Context</h4>
                  <p>{facility.wikipedia_info.building_context}</p>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="col-md-4">
          {/* Map Section */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Location</h5>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={facility.geometry.location}
                zoom={16}
                onLoad={(map) => {
                  console.log('Facility detail map loaded successfully');
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
                {DEBUG && (
                  <div className="position-absolute top-0 start-0 bg-white p-2 m-2 rounded shadow-sm" style={{zIndex: 1000}}>
                    <div>Facility: {facility.facility_name || 'Unknown'}</div>
                    <div>Coordinates: {facility.geometry.location.lat.toFixed(4)}, {facility.geometry.location.lng.toFixed(4)}</div>
                  </div>
                )}
                <FontAwesomeMarker
                  position={facility.geometry.location}
                  icon={faLocationDot}
                  color="danger"
                  size="2x"
                  title={facility.facility_name || facility.formatted_address}
                  label="F"
                />
              </GoogleMap>
            </div>
          </div>
          
          {/* Additional Information */}
          {facility.historical_info && facility.historical_info.recent_developments && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Recent Developments</h5>
                <p><strong>Date:</strong> {facility.historical_info.recent_developments.date}</p>
                <p>{facility.historical_info.recent_developments.note}</p>
              </div>
            </div>
          )}
          
          {/* Details Section */}
          {facility.details && (
            <div className="card mt-4">
              <div className="card-body">
                <h5 className="card-title">Contact Information</h5>
                {facility.details.phone && (
                  <p><strong>Phone:</strong> {facility.details.phone}</p>
                )}
                {facility.details.website && (
                  <p><strong>Website:</strong> <a href={facility.details.website} target="_blank" rel="noopener noreferrer">{facility.details.website}</a></p>
                )}
                {facility.details.hours && (
                  <p><strong>Hours:</strong> {facility.details.hours}</p>
                )}
                {facility.details.description && (
                  <div className="mt-3">
                    <h6>Description</h6>
                    <p>{facility.details.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
