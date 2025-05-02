import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/router';

export default function ContactsList() {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateData, setDuplicateData] = useState({
    originalContact: null,
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    profileImage: null,
    profileImagePreview: null
  });
  const [duplicating, setDuplicating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Function to delete a contact
  const deleteContact = async (contactId) => {
    if (!confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
      return;
    }
    
    setDeleting(true);
    
    try {
      const response = await fetch(`/api/contact/${contactId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }
      
      // Refresh the contacts list
      fetchContacts();
      
    } catch (err) {
      console.error('Error deleting contact:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Function to fetch contacts
  async function fetchContacts() {
    try {
      setLoading(true);
      const response = await fetch('/api/contacts');
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  
  // Function to open the duplicate modal
  const openDuplicateModal = (contact) => {
    setDuplicateData({
      originalContact: contact,
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      profileImage: null,
      profileImagePreview: null
    });
    setShowDuplicateModal(true);
    setShowPreview(false);
  };
  
  // Function to handle profile image upload
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDuplicateData(prev => ({
          ...prev,
          profileImage: file,
          profileImagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Function to handle input changes in the duplicate form
  const handleDuplicateInputChange = (e) => {
    const { id, value } = e.target;
    setDuplicateData(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  // Function to preview the duplicated contact
  const previewDuplicatedContact = () => {
    // Validate required fields
    if (!duplicateData.firstName || !duplicateData.lastName || !duplicateData.phone || !duplicateData.email) {
      alert('Please fill in all required fields (First Name, Last Name, Phone, and Email)');
      return;
    }
    
    setShowPreview(true);
  };
  
  // Function to save the duplicated contact
  const saveDuplicatedContact = async () => {
    // Validate required fields
    if (!duplicateData.firstName || !duplicateData.lastName || !duplicateData.phone || !duplicateData.email) {
      alert('Please fill in all required fields (First Name, Last Name, Phone, and Email)');
      return;
    }
    
    setDuplicating(true);
    
    try {
      // Create a new contact object based on the original contact
      const newContact = {
        ...duplicateData.originalContact,
        firstName: duplicateData.firstName,
        lastName: duplicateData.lastName,
        phone: duplicateData.phone,
        email: duplicateData.email,
        // Don't set profileImage here, let the API handle it
        profileImage: null
      };
      
      // Remove any properties that might cause issues
      delete newContact.id;
      delete newContact.qrCode;
      
      // Generate filename for the new contact
      const filename = `${duplicateData.firstName.toLowerCase()}_${duplicateData.lastName.toLowerCase()}.json`;
      
      // Send the new contact to the API
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          contact: newContact, 
          filename: filename,
          profileImage: duplicateData.profileImagePreview
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save duplicated contact');
      }
      
      // Close the modal and refresh contacts
      setShowDuplicateModal(false);
      setShowPreview(false);
      fetchContacts();
      
      // Show success message
      alert(`Contact for ${duplicateData.firstName} ${duplicateData.lastName} has been created successfully!`);
      
    } catch (err) {
      console.error('Error saving duplicated contact:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setDuplicating(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <Layout>
      <Head>
        <title>Contacts List | Henderson Geocode</title>
        <meta name="description" content="View all contacts with QR codes" />
      </Head>

      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>
            <i className="fas fa-address-book me-2"></i> Contacts List
          </h1>
          <Link href="/qr-contact" className="btn btn-primary">
            <i className="fas fa-plus me-1"></i> Add New Contact
          </Link>
        </div>

        {(loading || deleting) && (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span className="ms-2">{deleting ? 'Deleting contact...' : 'Loading contacts...'}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Error: {error}
          </div>
        )}

        {!loading && !error && contacts.length === 0 && (
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            No contacts found. Add your first contact by clicking the "Add New Contact" button.
          </div>
        )}

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {contacts.map((contact, index) => (
            <div className="col" key={index}>
              <div className="card h-100">
                <div className="card-body text-center">
                  {contact.qrCode ? (
                    <img 
                      src={contact.qrCode} 
                      alt={`QR Code for ${contact.firstName} ${contact.lastName}`}
                      className="img-fluid mb-3"
                      style={{ maxWidth: '200px' }}
                    />
                  ) : (
                    <div className="d-flex justify-content-center mb-3">
                      <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                        <QRCodeSVG
                          value={generateVCard(contact)}
                          size={200}
                          level="H"
                          includeMargin={true}
                          imageSettings={{
                            src: contact.profileImage ? `/contact_assets/${contact.profileImage}` : '/logo.svg',
                            x: undefined,
                            y: undefined,
                            height: 40,
                            width: 40,
                            excavate: true,
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="d-flex justify-content-center mb-3">
                    {contact.profileImage ? (
                      <img
                        src={`/contact_assets/${contact.profileImage}`}
                        alt={`${contact.firstName} ${contact.lastName}`}
                        className="rounded-circle"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                        style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                      >
                        {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <h5 className="card-title">
                    {contact.firstName} {contact.lastName}
                  </h5>
                  
                  {contact.jobTitle && (
                    <p className="card-text text-muted mb-1">{contact.jobTitle}</p>
                  )}
                  
                  {contact.company && (
                    <p className="card-text text-muted mb-2">{contact.company}</p>
                  )}
                  
                  <div className="d-flex flex-column align-items-start mb-3">
                    <div className="mb-1">
                      <i className="fas fa-envelope me-2 text-primary"></i>
                      <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    </div>
                    
                    <div>
                      <i className="fas fa-phone me-2 text-primary"></i>
                      <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-center mb-3">
                    <a 
                      href={`data:text/vcard;charset=utf-8,${encodeURIComponent(generateVCard(contact))}`}
                      download={`${contact.firstName.toLowerCase()}_${contact.lastName.toLowerCase()}.vcf`}
                      className="btn btn-sm btn-outline-primary me-2"
                    >
                      <i className="fas fa-download me-1"></i> Download vCard
                    </a>
                    
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => window.open(`data:text/vcard;charset=utf-8,${encodeURIComponent(generateVCard(contact))}`)}
                    >
                      <i className="fas fa-qrcode me-1"></i> View QR
                    </button>
                  </div>
                  
                  <div className="d-flex justify-content-center gap-2">
                    <Link 
                      href={`/edit-contact/${contact.firstName.toLowerCase()}_${contact.lastName.toLowerCase()}`}
                      className="btn btn-sm btn-primary"
                    >
                      <i className="fas fa-edit me-1"></i> Edit
                    </Link>
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => openDuplicateModal(contact)}
                    >
                      <i className="fas fa-copy me-1"></i> Duplicate
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteContact(`${contact.firstName.toLowerCase()}_${contact.lastName.toLowerCase()}`)}
                      disabled={deleting}
                    >
                      <i className="fas fa-trash-alt me-1"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Duplicate Contact Modal */}
      {showDuplicateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-copy me-2"></i>
                  Duplicate Contact
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowDuplicateModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {!showPreview ? (
                  <div>
                    <p className="mb-3">
                      You are duplicating the contact for <strong>{duplicateData.originalContact?.firstName} {duplicateData.originalContact?.lastName}</strong>. 
                      Please provide the new contact information:
                    </p>
                    
                    <div className="row mb-3">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="firstName" className="form-label">First Name <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="firstName" 
                          value={duplicateData.firstName}
                          onChange={handleDuplicateInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="lastName" className="form-label">Last Name <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="lastName" 
                          value={duplicateData.lastName}
                          onChange={handleDuplicateInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="phone" className="form-label">Phone Number <span className="text-danger">*</span></label>
                        <input 
                          type="tel" 
                          className="form-control" 
                          id="phone" 
                          value={duplicateData.phone}
                          onChange={handleDuplicateInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">Email <span className="text-danger">*</span></label>
                        <input 
                          type="email" 
                          className="form-control" 
                          id="email" 
                          value={duplicateData.email}
                          onChange={handleDuplicateInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="profileImage" className="form-label">Profile Image</label>
                      <input 
                        type="file" 
                        className="form-control" 
                        id="profileImage" 
                        accept="image/*"
                        onChange={handleProfileImageChange}
                      />
                      {duplicateData.profileImagePreview && (
                        <div className="mt-2 text-center">
                          <img 
                            src={duplicateData.profileImagePreview} 
                            alt="Profile Preview" 
                            className="img-thumbnail" 
                            style={{ maxHeight: '100px' }} 
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      All other information will be copied from the original contact.
                    </div>
                  </div>
                ) : (
                  <div>
                    <h5 className="mb-3">Preview Contact</h5>
                    <div className="card">
                      <div className="card-body">
                        <div className="d-flex justify-content-center mb-3">
                          <QRCodeSVG
                            value={generateVCard({
                              ...duplicateData.originalContact,
                              firstName: duplicateData.firstName,
                              lastName: duplicateData.lastName,
                              phone: duplicateData.phone
                            })}
                            size={200}
                            level="H"
                            includeMargin={true}
                            imageSettings={{
                              src: duplicateData.profileImagePreview || duplicateData.originalContact?.profileImage || '/logo.svg',
                              x: undefined,
                              y: undefined,
                              height: 40,
                              width: 40,
                              excavate: true,
                            }}
                          />
                        </div>
                        
                        <h5 className="card-title text-center">
                          {duplicateData.firstName} {duplicateData.lastName}
                        </h5>
                        
                        {duplicateData.originalContact?.jobTitle && (
                          <p className="card-text text-center">{duplicateData.originalContact.jobTitle}</p>
                        )}
                        
                        {duplicateData.originalContact?.company && (
                          <p className="card-text text-center">{duplicateData.originalContact.company}</p>
                        )}
                        
                        <div className="text-center mb-3">
                          <div>
                            <i className="fas fa-envelope me-2 text-primary"></i>
                            <a href={`mailto:${duplicateData.email}`}>{duplicateData.email}</a>
                          </div>
                          
                          <div>
                            <i className="fas fa-phone me-2 text-primary"></i>
                            <a href={`tel:${duplicateData.phone}`}>{duplicateData.phone}</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDuplicateModal(false)}
                >
                  Cancel
                </button>
                
                {!showPreview ? (
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={previewDuplicatedContact}
                  >
                    <i className="fas fa-eye me-1"></i> Preview
                  </button>
                ) : (
                  <>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowPreview(false)}
                    >
                      <i className="fas fa-arrow-left me-1"></i> Back
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-success" 
                      onClick={saveDuplicatedContact}
                      disabled={duplicating}
                    >
                      {duplicating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-1"></i> Save Contact
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

// Helper function to generate vCard format
function generateVCard(contact) {
  let vcard = 'BEGIN:VCARD\n';
  vcard += 'VERSION:3.0\n';
  vcard += `N:${contact.lastName};${contact.firstName};;;\n`;
  vcard += `FN:${contact.firstName} ${contact.lastName}\n`;
  
  if (contact.company) {
    vcard += `ORG:${contact.company}\n`;
  }
  
  if (contact.jobTitle) {
    vcard += `TITLE:${contact.jobTitle}\n`;
  }
  
  if (contact.email) {
    vcard += `EMAIL;type=INTERNET;type=HOME:${contact.email}\n`;
  }
  
  if (contact.workEmail && contact.workEmail !== contact.email) {
    vcard += `EMAIL;type=INTERNET;type=WORK:${contact.workEmail}\n`;
  }
  
  if (contact.phone) {
    vcard += `TEL;type=CELL:${contact.phone}\n`;
  }
  
  if (contact.workPhone) {
    vcard += `TEL;type=WORK:${contact.workPhone}\n`;
  }
  
  if (contact.workAddress) {
    vcard += `ADR;type=WORK:;;${contact.workAddress};;;;\n`;
  }
  
  if (contact.website) {
    vcard += `URL:${contact.website}\n`;
  }
  
  if (contact.birthday) {
    // Format: YYYYMMDD
    const bday = contact.birthday.replace(/-/g, '');
    vcard += `BDAY:${bday}\n`;
  }
  
  if (contact.notes) {
    vcard += `NOTE:${contact.notes}\n`;
  }
  
  // Social media as URLs
  if (contact.linkedin) {
    vcard += `URL;type=linkedin:${contact.linkedin}\n`;
  }
  
  if (contact.twitter) {
    let twitterUrl = contact.twitter;
    if (twitterUrl.startsWith('@')) {
      twitterUrl = 'https://twitter.com/' + twitterUrl.substring(1);
    }
    vcard += `URL;type=twitter:${twitterUrl}\n`;
  }
  
  if (contact.facebook) {
    vcard += `URL;type=facebook:${contact.facebook}\n`;
  }
  
  if (contact.instagram) {
    let instagramUrl = contact.instagram;
    if (instagramUrl.startsWith('@')) {
      instagramUrl = 'https://instagram.com/' + instagramUrl.substring(1);
    }
    vcard += `URL;type=instagram:${instagramUrl}\n`;
  }
  
  // Add profile image as PHOTO if available
  if (contact.profileImage) {
    // For image paths, reference the URL instead of embedding the image
    // This prevents the QR code from becoming too large
    try {
      const imageUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/contact_assets/${contact.profileImage}` 
        : `/contact_assets/${contact.profileImage}`;
      vcard += `PHOTO;VALUE=uri:${imageUrl}\n`;
    } catch (error) {
      console.error('Error adding photo to vCard:', error);
      // Continue without the photo if there's an error
    }
  }
  
  vcard += 'END:VCARD';
  return vcard;
}
