import Layout from '../components/Layout';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLocationDot, 
  faMapLocationDot, 
  faQrcode, 
  faPlusCircle,
  faAddressBook,
  faAddressCard,
  faChartLine,
  faUsers,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  return (
    <Layout title="Magnetic Lighthouse Community Development Corporation Tools Dashboard">
      <div className="container py-4">
        {/* Dashboard Overview Cards */}
        <section className="mb-5">
          <h2 className="h4 mb-4">Dashboard Overview</h2>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card stat-card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon bg-primary bg-opacity-10 text-primary me-3">
                      <FontAwesomeIcon icon={faMapLocationDot} />
                    </div>
                    <div>
                      <h5 className="card-title">Locations</h5>
                      <p className="card-text text-muted mb-0">12 active locations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card stat-card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon bg-success bg-opacity-10 text-success me-3">
                      <FontAwesomeIcon icon={faQrcode} />
                    </div>
                    <div>
                      <h5 className="card-title">QR Codes</h5>
                      <p className="card-text text-muted mb-0">8 generated codes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card stat-card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon bg-info bg-opacity-10 text-info me-3">
                      <FontAwesomeIcon icon={faChartLine} />
                    </div>
                    <div>
                      <h5 className="card-title">Activity</h5>
                      <p className="card-text text-muted mb-0">Last updated: May 2, 2025</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Available Tools Section */}
        <section>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h4 mb-0">Available Tools</h2>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card app-card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="app-icon me-3 bg-primary text-white">
                      <FontAwesomeIcon icon={faLocationDot} />
                    </div>
                    <h5 className="card-title mb-0">Single Address GeoCode Lookup</h5>
                  </div>
                  <p className="card-text">Look up geographic coordinates for any address to support mapping and location-based services.</p>
                </div>
                <div className="card-footer bg-white border-top-0">
                  <Link href="/geocode" className="btn btn-platform-primary">Access Tool</Link>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 mb-4">
              <div className="card app-card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="app-icon me-3 bg-success text-white">
                      <FontAwesomeIcon icon={faMapLocationDot} />
                    </div>
                    <h5 className="card-title mb-0">Henderson Geocode Demo</h5>
                  </div>
                  <p className="card-text">Interactive map visualization of Henderson community locations with geographic data.</p>
                </div>
                <div className="card-footer bg-white border-top-0">
                  <Link href="/map" className="btn btn-platform-primary">Access Tool</Link>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 mb-4">
              <div className="card app-card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="app-icon me-3 bg-info text-white">
                      <FontAwesomeIcon icon={faQrcode} />
                    </div>
                    <h5 className="card-title mb-0">Henderson QR Codes</h5>
                  </div>
                  <p className="card-text">Generate and manage QR codes for Henderson community locations and services.</p>
                </div>
                <div className="card-footer bg-white border-top-0">
                  <Link href="/qrcodes" className="btn btn-platform-primary">Access Tool</Link>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 mb-4">
              <div className="card app-card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="app-icon me-3 bg-warning text-white">
                      <FontAwesomeIcon icon={faPlusCircle} />
                    </div>
                    <h5 className="card-title mb-0">Add New Henderson Location</h5>
                  </div>
                  <p className="card-text">Add new locations to the Henderson community database with geographic information.</p>
                </div>
                <div className="card-footer bg-white border-top-0">
                  <Link href="/add-location" className="btn btn-platform-primary">Access Tool</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
