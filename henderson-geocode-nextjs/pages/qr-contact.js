import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/router';

export default function QRContact() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
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
    
    // We'll handle the profile image separately when saving the contact
    // Rather than embedding it in the QR code which causes "Data too long" errors
    // The image will still be displayed in the QR code visually, but not encoded in the vCard data
    
    vcard += 'END:VCARD';
    return vcard;
  };

  // Download QR code as PNG
  const downloadQRCode = () => {
    if (!qrRef.current) return;
    
    const svgElement = qrRef.current.querySelector('svg');
    if (!svgElement) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const data = (new XMLSerializer()).serializeToString(svgElement);
    const DOMURL = window.URL || window.webkitURL || window;
    const img = new Image();
    const svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    const url = DOMURL.createObjectURL(svgBlob);
    
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      DOMURL.revokeObjectURL(url);
      
      const imgURI = canvas.toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      
      const fileName = `${contactData.firstName}_${contactData.lastName}_QR.png`;
      
      const downloadLink = document.createElement('a');
      downloadLink.download = fileName;
      downloadLink.href = imgURI;
      downloadLink.click();
    };
    
    img.src = url;
  };

  // Preview contact
  const previewContact = () => {
    // Validate required fields
    if (!contactData.firstName || !contactData.lastName || !contactData.email || !contactData.phone) {
      alert('Please fill in all required fields (First Name, Last Name, Email, and Phone)');
      return;
    }
    
    // Generate vCard
    const vcardData = generateVCard(contactData);
    setVcard(vcardData);
    
    // Show preview section
    setShowPreview(true);
    
    // Scroll to preview section
    setTimeout(() => {
      const previewSection = document.getElementById('previewSection');
      if (previewSection) {
        previewSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Save contact
  const saveContact = async (e) => {
    e.preventDefault();
    
    // Check if preview has been generated
    if (!vcard) {
      alert('Please preview the contact before saving');
      return;
    }
    
    // Show loading spinner
    setLoading(true);
    
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
      const contact = {
        ...contactData,
        createdAt: new Date().toISOString(),
        qrCode: qrCodeBase64
      };
      
      // Add profile image if available
      if (profileImage) {
        contact.profileImage = `${contact.firstName.toLowerCase()}_${contact.lastName.toLowerCase()}.jpg`;
      }
      
      // Create filename
      const filename = `${contact.firstName.toLowerCase()}_${contact.lastName.toLowerCase()}.json`;
      
      // Send data to API
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: contact,
          filename: filename,
          profileImage: profileImage
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save contact');
      }
      
      // Show success message
      setSuccessMessage(`Contact for ${contact.firstName} ${contact.lastName} saved successfully!`);
      setSuccess(true);
      
      // Reset form after a delay
      setTimeout(() => {
        formRef.current.reset();
        setContactData({
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
        setShowPreview(false);
        setProfileImage(null);
        setProfileImagePreview(null);
        setVcard('');
        setSuccess(false);
        
        // Redirect to contacts list
        router.push('/contacts-list');
      }, 3000);
      
    } catch (error) {
      console.error('Error saving contact:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>QR Contact Creator | Henderson Geocode</title>
        <meta name="description" content="Create QR codes for contact information" />
      </Head>
      
      <div className="container py-4">
        <h1 className="mb-4">
          <i className="fas fa-address-card me-2"></i> QR Contact Creator
        </h1>
        
        <div className="alert alert-info mb-4">
          <i className="fas fa-info-circle me-2"></i>
          Create a QR code for your contact information that can be scanned by any smartphone.
        </div>
        
        {loading && (
          <div className="d-flex justify-content-center my-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span className="ms-2">Processing your request...</span>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle me-2"></i>
            {successMessage}
            <div className="mt-3">
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => router.push('/contacts-list')}
              >
                <i className="fas fa-list me-1"></i> View All Contacts
              </button>
            </div>
          </div>
        )}
        
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
                    value={contactData.firstName}
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
                    value={contactData.lastName}
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
                    value={contactData.email}
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
                    value={contactData.phone}
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
                    value={contactData.company}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="jobTitle" className="form-label">Job Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="jobTitle" 
                    value={contactData.jobTitle}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="workAddress" className="form-label">Work Address</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="workAddress" 
                    value={contactData.workAddress}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="workPhone" className="form-label">Work Phone</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    id="workPhone" 
                    value={contactData.workPhone}
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
                    value={contactData.workEmail}
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
                    value={contactData.website}
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
                    value={contactData.birthday}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="notes" className="form-label">Notes</label>
                  <textarea 
                    className="form-control" 
                    id="notes" 
                    rows="3"
                    value={contactData.notes}
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
                    value={contactData.linkedin}
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
                    value={contactData.twitter}
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
                    value={contactData.facebook}
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
                    value={contactData.instagram}
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
          
          <div className="d-grid gap-2 d-md-flex justify-content-md-end mb-4">
            <button 
              type="button" 
              className="btn btn-secondary me-md-2"
              onClick={previewContact}
            >
              <i className="fas fa-eye me-1"></i> Preview
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              <i className="fas fa-save me-1"></i> Save Contact
            </button>
          </div>
        </form>
        
        {/* Preview Section */}
        {showPreview && (
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
                        <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                          <QRCodeSVG 
                            value={vcard}
                            size={200}
                            level="H"
                            includeMargin={true}
                            imageSettings={{
                              src: profileImagePreview || '/logo.svg',
                              x: undefined,
                              y: undefined,
                              height: 40,
                              width: 40,
                              excavate: true,
                            }}
                          />
                          <button 
                            className="btn btn-sm btn-primary position-absolute"
                            style={{ bottom: '5px', right: '5px' }}
                            onClick={downloadQRCode}
                            title="Download QR Code"
                          >
                            <i className="fas fa-download"></i>
                          </button>
                        </div>
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
