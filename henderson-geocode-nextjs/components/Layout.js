import Head from 'next/head';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkedAlt, faMap, faPlus, faQrcode, faAddressBook, faAddressCard, faLocationDot, faBuilding } from '@fortawesome/free-solid-svg-icons';

export default function Layout({ children, title = 'Magnetic Lighthouse Community Development Corporation Tools Dashboard' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Magnetic Lighthouse Community Development Corporation Tools Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="header">
        <div className="container">
          <h1 className="text-center">
            <FontAwesomeIcon icon={faMapMarkedAlt} className="me-2" /> 
            {title}
          </h1>
        </div>
      </header>

      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link href="/" className="nav-link">
                  <FontAwesomeIcon icon={faMapMarkedAlt} className="me-1" /> Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/map" className="nav-link">
                  <FontAwesomeIcon icon={faMap} className="me-1" /> Map
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/geocode" className="nav-link">
                  <FontAwesomeIcon icon={faLocationDot} className="me-1" /> Geocode
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/add-location" className="nav-link">
                  <FontAwesomeIcon icon={faPlus} className="me-1" /> Add Location
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/qrcodes" className="nav-link">
                  <FontAwesomeIcon icon={faQrcode} className="me-1" /> QR Codes
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/contacts-list" className="nav-link">
                  <FontAwesomeIcon icon={faAddressBook} className="me-1" /> Contacts
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/qr-contact" className="nav-link">
                  <FontAwesomeIcon icon={faAddressCard} className="me-1" /> Add Contact
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/platform" className="nav-link">
                  <FontAwesomeIcon icon={faBuilding} className="me-1" /> Platform Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="container main-content">
        {children}
      </main>

      <footer className="footer text-center">
        <div className="container">
          <p className="mb-0">
            Magnetic Lighthouse Community Development Corporation | <a href="https://developers.google.com/maps/documentation" target="_blank" rel="noopener noreferrer">Google Maps API Documentation</a>
          </p>
        </div>
      </footer>
    </>
  );
}
