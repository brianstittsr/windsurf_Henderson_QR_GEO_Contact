import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faInfoCircle, 
  faDownload, 
  faExternalLinkAlt,
  faTrash 
} from '@fortawesome/free-solid-svg-icons';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodesPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch('/api/locations');
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          setLocations(data.results);
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Failed to load locations');
      } finally {
        setLoading(false);
      }
    }
    
    fetchLocations();
  }, []);
  
  // Function to download QR code
  const downloadQRCode = (id, facilityName) => {
    const svgElement = document.getElementById(`qr-${id}`);
    if (!svgElement) return;
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Create an image from the SVG
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw white background and the image
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      // Convert to PNG and download
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_Code_${facilityName.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  };
  
  // Function to handle deleting a location
  const handleDelete = async (placeId, facilityName) => {
    if (window.confirm(`Are you sure you want to delete ${facilityName}? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/locations?place_id=${placeId}`, {
          method: 'DELETE',
        });
        const result = await response.json();

        if (response.ok && result.success) {
          alert(`${facilityName} has been deleted successfully.`);
          // Update the local state to reflect the deletion
          setLocations(prevLocations => prevLocations.filter(loc => loc.place_id !== placeId));
        } else {
          alert(`Failed to delete ${facilityName}: ${result.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.error('Error deleting location:', err);
        alert(`An error occurred while deleting ${facilityName}. See console for details.`);
      }
    }
  };

  return (
    <Layout title="Henderson QR Codes">
      <Link href="/" className="back-link">
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
      </Link>
      
      <div className="alert alert-info mb-4">
        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
        Scan these QR codes with your mobile device to access detailed information about Henderson locations.
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
      ) : locations.length === 0 ? (
        <div className="alert alert-warning">
          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
          No locations found. Add some locations to see QR codes here.
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {locations.map((location) => {
            const facilityName = location.facility_name || location.formatted_address;
            const detailUrl = `/facility/${location.place_id}`;
            const qrId = `qr-${location.place_id.replace(/[^a-zA-Z0-9]/g, '')}`;
            
            return (
              <div key={location.place_id} className="col">
                <div className="card qr-card h-100">
                  <div className="qr-code-container">
                    <QRCodeSVG 
                      id={qrId}
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}${detailUrl}`}
                      size={200}
                      level="H"
                      includeMargin={true}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                    />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">
                      <Link href={detailUrl} className="qr-title" target="_blank">
                        {facilityName}
                      </Link>
                    </h5>
                    <p className="card-text text-muted" style={{ fontSize: '0.9rem' }}>
                      {location.formatted_address}
                    </p>
                    <div className="d-flex gap-2 mt-3">
                      <Link 
                        href={detailUrl} 
                        className="btn btn-primary btn-sm"
                        target="_blank"
                      >
                        <FontAwesomeIcon icon={faExternalLinkAlt} className="me-1" /> View Details
                      </Link>
                      <button 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => downloadQRCode(location.place_id.replace(/[^a-zA-Z0-9]/g, ''), facilityName)}
                      >
                        <FontAwesomeIcon icon={faDownload} className="me-1" /> Download QR
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(location.place_id, facilityName)}
                      >
                        <FontAwesomeIcon icon={faTrash} className="me-1" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
