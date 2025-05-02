import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/router';

export default function EditContact() {
  const router = useRouter();
  const { id } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [originalFilename, setOriginalFilename] = useState('');
  const [contactData, setContactData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    workAddress: '',
    workPhone: '',
    workEmail: '',
    website: '',
    birthday: '',
    notes: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: ''
  });
  const [vcard, setVcard] = useState('');
  const formRef = useRef(null);
  const qrRef = useRef(null);

  // Fetch contact data when the component mounts
  useEffect(() => {
    async function fetchContactData() {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/contact/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch contact data');
        }
        
        const data = await response.json();
        setContactData(data.contact);
        setOriginalFilename(id);
        
        // Set profile image preview if available
        if (data.contact.profileImage) {
          setProfileImagePreview(`/contact_assets/${data.contact.profileImage}`);
        }
        
        // Generate vCard for preview
        const vcardText = generateVCard(data.contact);
        setVcard(vcardText);
        setShowPreview(true);
        
      } catch (error) {
        console.error('Error fetching contact:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchContactData();
  }, [id]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setContactData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size exceeds 2MB limit');
      e.target.value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      // Display image preview
      setProfileImagePreview(e.target.result);
      setProfileImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Generate vCard format
  const generateVCard = (data) => {
    let vcard = 'BEGIN:VCARD\n';
    vcard += 'VERSION:3.0\n';
    vcard += `N:${data.lastName};${data.firstName};;;\n`;
    vcard += `FN:${data.firstName} ${data.lastName}\n`;
    
    if (data.company) {
      vcard += `ORG:${data.company}\n`;
    }
    
    if (data.jobTitle) {
      vcard += `TITLE:${data.jobTitle}\n`;
    }
    
    if (data.email) {
      vcard += `EMAIL;type=INTERNET;type=HOME:${data.email}\n`;
    }
    
    if (data.workEmail && data.workEmail !== data.email) {
      vcard += `EMAIL;type=INTERNET;type=WORK:${data.workEmail}\n`;
    }
    
    if (data.phone) {
      vcard += `TEL;type=CELL:${data.phone}\n`;
    }
    
    if (data.workPhone) {
      vcard += `TEL;type=WORK:${data.workPhone}\n`;
    }
    
    if (data.workAddress) {
      vcard += `ADR;type=WORK:;;${data.workAddress};;;;\n`;
    }
    
    if (data.website) {
      vcard += `URL:${data.website}\n`;
    }
    
    if (data.birthday) {
      // Format: YYYYMMDD
      const bday = data.birthday.replace(/-/g, '');
      vcard += `BDAY:${bday}\n`;
    }
    
    if (data.notes) {
      vcard += `NOTE:${data.notes}\n`;
    }
    
    // Social media as URLs
    if (data.linkedin) {
      vcard += `URL;type=linkedin:${data.linkedin}\n`;
    }
    
    if (data.twitter) {
      let twitterUrl = data.twitter;
      if (twitterUrl.startsWith('@')) {
        twitterUrl = 'https://twitter.com/' + twitterUrl.substring(1);
      }
      vcard += `URL;type=twitter:${twitterUrl}\n`;
    }
    
    if (data.facebook) {
      vcard += `URL;type=facebook:${data.facebook}\n`;
    }
    
    if (data.instagram) {
      let instagramUrl = data.instagram;
      if (instagramUrl.startsWith('@')) {
        instagramUrl = 'https://instagram.com/' + instagramUrl.substring(1);
      }
      vcard += `URL;type=instagram:${instagramUrl}\n`;
    }
    
    vcard += 'END:VCARD';
    return vcard;
  };

  // Preview contact
  const previewContact = () => {
    // Validate required fields
    if (!contactData.firstName || !contactData.lastName || !contactData.email || !contactData.phone) {
      alert('Please fill in all required fields (First Name, Last Name, Email, and Phone)');
      return;
    }
    
    // Generate vCard
    const vcardText = generateVCard(contactData);
    setVcard(vcardText);
    
    // Show preview section
    setShowPreview(true);
    
    // Scroll to preview section
    setTimeout(() => {
      document.getElementById('previewSection')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Save updated contact
  const saveContact = async (e) => {
    e.preventDefault();
    
    // Check if preview has been generated
    if (!vcard) {
      alert('Please preview the contact before saving');
      return;
    }
    
    // Show loading spinner
    setSaving(true);
    
    try {
      // Get QR code as base64
      let qrCodeBase64 = '';
      if (qrRef.current) {
        // Convert SVG to canvas and then to base64
        const svgElement = qrRef.current.querySelector('svg');
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        // Set canvas dimensions to match SVG
        canvas.width = svgElement.width.baseVal.value;
        canvas.height = svgElement.height.baseVal.value;
        
        // Create a data URL from the SVG
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        // Wait for the image to load
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = url;
        });
        
        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0);
        qrCodeBase64 = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
      }
      
      // Create contact data object
      const updatedContact = {
        ...contactData,
        qrCode: qrCodeBase64
      };
      
      // Add profile image if available
      if (profileImage) {
        updatedContact.profileImage = `${updatedContact.firstName.toLowerCase()}_${updatedContact.lastName.toLowerCase()}.jpg`;
      }
      
      // Send data to API
      const response = await fetch(`/api/contact/${originalFilename}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: updatedContact,
          profileImage: profileImage
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update contact');
      }
      
      // Show success message
      setSuccessMessage(`Contact for ${updatedContact.firstName} ${updatedContact.lastName} updated successfully!`);
      setSuccess(true);
      
      // Redirect after a delay
      setTimeout(() => {
        router.push('/contacts-list');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating contact:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Delete contact
  const deleteContact = async () => {
    if (!confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
      return;
    }
    
    setSaving(true);
    
    try {
      const response = await fetch(`/api/contact/${originalFilename}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }
      
      // Show success message
      setSuccessMessage('Contact deleted successfully!');
      setSuccess(true);
      
      // Redirect after a delay
      setTimeout(() => {
        router.push('/contacts-list');
      }, 2000);
      
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Edit Contact | Henderson Geocode</title>
        <meta name="description" content="Edit contact information" />
      </Head>
      
      <div className="container py-4">
        <h1 className="mb-4">
          <i className="fas fa-edit me-2"></i> Edit Contact
        </h1>
        
        {loading && (
          <div className="d-flex justify-content-center my-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span className="ms-2">Loading contact information...</span>
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
            <div className="mt-3">
              <button 
                className="btn btn-primary"
                onClick={() => router.push('/contacts-list')}
              >
                Return to Contacts List
              </button>
            </div>
          </div>
        )}
        
        {saving && (
          <div className="d-flex justify-content-center my-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Saving...</span>
            </div>
            <span className="ms-2">Saving changes...</span>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle me-2"></i>
            {successMessage}
          </div>
        )}
        
        {!loading && !error && (
          <form ref={formRef} onSubmit={saveContact}>
            {/* Basic Information Section */}
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h3 className="mb-0">Basic Information</h3>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="firstName" className="form-label">
                      First Name <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="firstName" 
                      value={contactData.firstName || ''}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="lastName" className="form-label">
                      Last Name <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="lastName" 
                      value={contactData.lastName || ''}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="email" 
                      value={contactData.email || ''}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="phone" className="form-label">
                      Phone <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      id="phone" 
                      value={contactData.phone || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. (123) 456-7890"
                      required 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Work Information Section */}
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h3 className="mb-0">Work Information</h3>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="company" className="form-label">Company</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="company" 
                      value={contactData.company || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="jobTitle" className="form-label">Job Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="jobTitle" 
                      value={contactData.jobTitle || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="workAddress" className="form-label">Work Address</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="workAddress" 
                      value={contactData.workAddress || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="workPhone" className="form-label">Work Phone</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      id="workPhone" 
                      value={contactData.workPhone || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. (123) 456-7890"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="workEmail" className="form-label">Work Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="workEmail" 
                      value={contactData.workEmail || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional Information Section */}
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h3 className="mb-0">Additional Information</h3>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="website" className="form-label">Website</label>
                    <input 
                      type="url" 
                      className="form-control" 
                      id="website" 
                      value={contactData.website || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. https://example.com"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="birthday" className="form-label">Birthday</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      id="birthday" 
                      value={contactData.birthday || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="notes" className="form-label">Notes</label>
                    <textarea 
                      className="form-control" 
                      id="notes" 
                      rows="3"
                      value={contactData.notes || ''}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Social Media Section */}
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h3 className="mb-0">Social Media</h3>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="linkedin" className="form-label">LinkedIn</label>
                    <input 
                      type="url" 
                      className="form-control" 
                      id="linkedin" 
                      value={contactData.linkedin || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. https://linkedin.com/in/username"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="twitter" className="form-label">Twitter</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="twitter" 
                      value={contactData.twitter || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. @username"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="facebook" className="form-label">Facebook</label>
                    <input 
                      type="url" 
                      className="form-control" 
                      id="facebook" 
                      value={contactData.facebook || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. https://facebook.com/username"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="instagram" className="form-label">Instagram</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="instagram" 
                      value={contactData.instagram || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. @username"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profile Image Section */}
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h3 className="mb-0">Profile Image</h3>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="profileImage" className="form-label">Upload Image</label>
                    <input 
                      type="file" 
                      className="form-control" 
                      id="profileImage" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <div className="form-text">Upload a profile image (JPG, PNG). Max size: 2MB</div>
                  </div>
                  <div className="col-md-6 d-flex align-items-center justify-content-center">
                    {profileImagePreview && (
                      <img 
                        src={profileImagePreview} 
                        alt="Profile Preview" 
                        className="rounded-circle"
                        style={{ maxWidth: '150px', maxHeight: '150px' }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="d-flex justify-content-between mb-4">
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={deleteContact}
                disabled={saving}
              >
                <i className="fas fa-trash-alt me-1"></i> Delete Contact
              </button>
              
              <div>
                <button 
                  type="button" 
                  className="btn btn-secondary me-2"
                  onClick={previewContact}
                  disabled={saving}
                >
                  <i className="fas fa-eye me-1"></i> Preview
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  <i className="fas fa-save me-1"></i> Save Changes
                </button>
              </div>
            </div>
          </form>
        )}
        
        {/* Preview Section */}
        {showPreview && !loading && !error && (
          <div id="previewSection" className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Contact Preview</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body text-center">
                      <div ref={qrRef} className="d-flex justify-content-center mb-3">
                        <QRCodeSVG 
                          value={vcard}
                          size={200}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      <h5 className="card-title mt-3">
                        {contactData.firstName} {contactData.lastName}
                      </h5>
                      {contactData.jobTitle && (
                        <p className="card-text">{contactData.jobTitle}</p>
                      )}
                      {contactData.company && (
                        <p className="card-text">{contactData.company}</p>
                      )}
                      <p className="card-text">
                        <i className="fas fa-envelope me-2"></i>{contactData.email}
                      </p>
                      <p className="card-text">
                        <i className="fas fa-phone me-2"></i>{contactData.phone}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">vCard Format</h5>
                      <div 
                        className="bg-light p-3 rounded" 
                        style={{ 
                          fontFamily: 'monospace', 
                          whiteSpace: 'pre-wrap',
                          fontSize: '0.8rem',
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}
                      >
                        {vcard}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
