import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faInfoCircle, 
  faEye, 
  faSave, 
  faCheckCircle, 
  faMapMarkedAlt, 
  faQrcode 
} from '@fortawesome/free-solid-svg-icons';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { QRCodeSVG } from 'qrcode.react';

// Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyClSdztRAcx5_O7LSuuJEuWsNP9JZgkFKQ';

// Map container style
const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px'
};

// Henderson, NC center coordinates
const center = {
  lat: 36.3296,
  lng: -78.4186
};

export default function AddLocation() {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    facilityName: '',
    category: '',
    address: '',
    yearBuilt: '',
    architecturalStyle: '',
    historicalSignificance: '',
    currentStatus: '',
    phone: '',
    website: '',
    hours: '',
    description: '',
    buildingContext: '',
    architectInfo: ''
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [markerPosition, setMarkerPosition] = useState(null);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  // Handle marker drag
  const handleMarkerDrag = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPosition({ lat, lng });
    
    if (previewData) {
      setPreviewData({
        ...previewData,
        geometry: {
          ...previewData.geometry,
          location: { lat, lng }
        }
      });
    }
  };
  
  // Preview location
  const handlePreview = async () => {
    // Validate required fields
    if (!formData.facilityName || !formData.address || !formData.category) {
      setError('Please fill in all required fields (Facility Name, Category, and Address)');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Geocode the address using Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(formData.address)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Geocoding failed: ${data.status}`);
      }
      
      const result = data.results[0];
      
      // Create preview data
      const locationData = {
        facility_name: formData.facilityName,
        formatted_address: result.formatted_address,
        geometry: {
          location: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng
          }
        },
        place_id: result.place_id,
        types: [formData.category.toLowerCase()],
        address_components: result.address_components
      };
      
      // Add historical info if provided
      if (formData.yearBuilt || formData.architecturalStyle || formData.historicalSignificance || formData.currentStatus) {
        locationData.historical_info = {
          year_built: formData.yearBuilt || "",
          architectural_style: formData.architecturalStyle || "",
          historical_significance: formData.historicalSignificance || "",
          current_status: formData.currentStatus || ""
        };
      }
      
      // Add details if provided
      if (formData.phone || formData.website || formData.hours || formData.description) {
        locationData.details = {
          phone: formData.phone || "",
          website: formData.website || "",
          hours: formData.hours || "",
          description: formData.description || ""
        };
      }
      
      // Add Wikipedia info if provided
      if (formData.buildingContext || formData.architectInfo) {
        locationData.wikipedia_info = {
          building_context: formData.buildingContext || "",
          architects: {
            info: formData.architectInfo || ""
          }
        };
      }
      
      // Update state
      setPreviewData(locationData);
      setMapCenter(result.geometry.location);
      setMarkerPosition(result.geometry.location);
      
    } catch (error) {
      console.error('Error previewing location:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Save location
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!previewData) {
      setError('Please preview the location before saving');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Send data to API endpoint
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(previewData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save location');
      }
      
      // Show success message
      setSuccess(true);
      
      // Reset form after a delay
      setTimeout(() => {
        setFormData({
          facilityName: '',
          category: '',
          address: '',
          yearBuilt: '',
          architecturalStyle: '',
          historicalSignificance: '',
          currentStatus: '',
          phone: '',
          website: '',
          hours: '',
          description: '',
          buildingContext: '',
          architectInfo: ''
        });
        setPreviewData(null);
        setMarkerPosition(null);
        window.scrollTo(0, 0);
      }, 5000);
      
    } catch (error) {
      console.error('Error saving location:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout title="Add New Henderson Location">
      <Link href="/" className="back-link">
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
      </Link>
      
      <div className="alert alert-info mb-4">
        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
        Fill out this form to add a new location in Henderson, NC. The system will geocode the address, generate a QR code, and add it to the database.
      </div>
      
      {loading && (
        <div className="d-flex justify-content-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-2">Processing your request...</span>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger">
          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
          Location "{previewData?.facility_name}" added successfully!
          <div className="mt-3">
            <Link href="/map" className="btn btn-primary btn-sm me-2">
              <FontAwesomeIcon icon={faMapMarkedAlt} className="me-1" /> View on Map
            </Link>
            <Link href="/qrcodes" className="btn btn-primary btn-sm">
              <FontAwesomeIcon icon={faQrcode} className="me-1" /> View QR Codes
            </Link>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="facilityName" className="form-label required-field">Facility Name</label>
              <input 
                type="text" 
                className="form-control" 
                id="facilityName" 
                value={formData.facilityName}
                onChange={handleChange}
                required 
              />
              <div className="form-text">The name of the facility or location</div>
            </div>
            <div className="col-md-6">
              <label htmlFor="category" className="form-label required-field">Category</label>
              <select 
                className="form-select" 
                id="category" 
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select a category</option>
                <option value="Government">Government</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Recreation">Recreation</option>
                <option value="Historic">Historic</option>
                <option value="Commercial">Commercial</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Other">Other</option>
              </select>
              <div className="form-text">The type of facility</div>
            </div>
          </div>
        </div>
        
        {/* Address Section */}
        <div className="form-section">
          <h3>Address Information</h3>
          <div className="row g-3">
            <div className="col-md-12">
              <label htmlFor="address" className="form-label required-field">Full Address</label>
              <input 
                type="text" 
                className="form-control" 
                id="address" 
                value={formData.address}
                onChange={handleChange}
                required 
                placeholder="e.g. 134 Rose Ave, Henderson, NC 27536" 
              />
              <div className="form-text">Enter the complete address including street, city, state, and zip code</div>
            </div>
          </div>
        </div>
        
        {/* Historical Information Section */}
        <div className="form-section">
          <h3>Historical Information</h3>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="yearBuilt" className="form-label">Year Built</label>
              <input 
                type="number" 
                className="form-control" 
                id="yearBuilt" 
                value={formData.yearBuilt}
                onChange={handleChange}
                min="1700" 
                max="2025" 
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="architecturalStyle" className="form-label">Architectural Style</label>
              <input 
                type="text" 
                className="form-control" 
                id="architecturalStyle" 
                value={formData.architecturalStyle}
                onChange={handleChange}
              />
            </div>
            <div className="col-12">
              <label htmlFor="historicalSignificance" className="form-label">Historical Significance</label>
              <textarea 
                className="form-control" 
                id="historicalSignificance" 
                value={formData.historicalSignificance}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>
            <div className="col-12">
              <label htmlFor="currentStatus" className="form-label">Current Status</label>
              <input 
                type="text" 
                className="form-control" 
                id="currentStatus" 
                value={formData.currentStatus}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        
        {/* Additional Details Section */}
        <div className="form-section">
          <h3>Additional Details</h3>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <input 
                type="tel" 
                className="form-control" 
                id="phone" 
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. (252) 123-4567" 
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="website" className="form-label">Website</label>
              <input 
                type="url" 
                className="form-control" 
                id="website" 
                value={formData.website}
                onChange={handleChange}
                placeholder="e.g. https://example.com" 
              />
            </div>
            <div className="col-12">
              <label htmlFor="hours" className="form-label">Operating Hours</label>
              <input 
                type="text" 
                className="form-control" 
                id="hours" 
                value={formData.hours}
                onChange={handleChange}
                placeholder="e.g. Monday-Friday: 9:00 AM - 5:00 PM" 
              />
            </div>
            <div className="col-12">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea 
                className="form-control" 
                id="description" 
                value={formData.description}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Wikipedia Information Section */}
        <div className="form-section">
          <h3>Wikipedia Information</h3>
          <div className="row g-3">
            <div className="col-12">
              <label htmlFor="buildingContext" className="form-label">Building Context</label>
              <textarea 
                className="form-control" 
                id="buildingContext" 
                value={formData.buildingContext}
                onChange={handleChange}
                rows="3"
              ></textarea>
              <div className="form-text">Information about the building's historical or cultural context</div>
            </div>
            <div className="col-12">
              <label htmlFor="architectInfo" className="form-label">Architect Information</label>
              <textarea 
                className="form-control" 
                id="architectInfo" 
                value={formData.architectInfo}
                onChange={handleChange}
                rows="3"
              ></textarea>
              <div className="form-text">Information about the architect(s) who designed the building</div>
            </div>
          </div>
        </div>
        
        <div className="d-grid gap-2 d-md-flex justify-content-md-end mb-4">
          <button 
            type="button" 
            className="btn btn-secondary me-md-2" 
            onClick={handlePreview}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faEye} className="me-1" /> Preview
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || !previewData}
          >
            <FontAwesomeIcon icon={faSave} className="me-1" /> Save Location
          </button>
        </div>
      </form>
      
      {/* Preview Section */}
      {previewData && (
        <div className="form-section">
          <h3>Location Preview</h3>
          <div className="row">
            <div className="col-md-6">
              <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={16}
                >
                  {markerPosition && (
                    <Marker
                      position={markerPosition}
                      draggable={true}
                      onDragEnd={handleMarkerDrag}
                    />
                  )}
                </GoogleMap>
              </LoadScript>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{previewData.facility_name}</h5>
                  <p className="card-text">{previewData.formatted_address}</p>
                  <p className="card-text"><strong>Category:</strong> {formData.category}</p>
                  <p className="card-text">
                    <strong>Coordinates:</strong> {previewData.geometry.location.lat.toFixed(6)}, {previewData.geometry.location.lng.toFixed(6)}
                  </p>
                  <div className="qr-code-container">
                    <QRCodeSVG 
                      value={`${window.location.origin}/facility/${previewData.place_id}`}
                      size={150}
                      level="H"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
