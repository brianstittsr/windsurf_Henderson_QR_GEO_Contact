import Head from 'next/head';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkedAlt, 
  faBuilding, 
  faChartLine, 
  faUsers, 
  faPlus,
  faCog,
  faLeaf,
  faSolarPanel,
  faCity,
  faWifi,
  faLandmark,
  faVrCardboard,
  faHistory
} from '@fortawesome/free-solid-svg-icons';

export default function PlatformDashboard() {
  return (
    <>
      <Head>
        <title>Magnetic Lighthouse aPaaS Platform</title>
        <meta name="description" content="Magnetic Lighthouse Community Development Corporation Application Platform as a Service" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js" defer></script>
      </Head>

      <div className="platform-container">
        <header className="platform-header bg-dark text-white py-4">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center">
              <h1 className="h3 mb-0">
                <FontAwesomeIcon icon={faBuilding} className="me-2" /> 
                Magnetic Lighthouse aPaaS
              </h1>
              <div>
                <button className="btn btn-outline-light me-2">
                  <FontAwesomeIcon icon={faCog} className="me-1" /> Settings
                </button>
                <button className="btn btn-outline-light">
                  <FontAwesomeIcon icon={faUsers} className="me-1" /> Admin
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container py-5">
          <section className="mb-5">
            <h2 className="h4 mb-4">Platform Overview</h2>
            <div className="row">
              <div className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">
                      <FontAwesomeIcon icon={faChartLine} className="me-2 text-primary" />
                      Applications
                    </h5>
                    <p className="card-text">3 active applications</p>
                  </div>
                  <div className="card-footer bg-white border-top-0">
                    <Link href="#" className="btn btn-sm btn-outline-primary">View All</Link>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">
                      <FontAwesomeIcon icon={faUsers} className="me-2 text-success" />
                      Users
                    </h5>
                    <p className="card-text">12 active users</p>
                  </div>
                  <div className="card-footer bg-white border-top-0">
                    <Link href="#" className="btn btn-sm btn-outline-success">Manage</Link>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">
                      <FontAwesomeIcon icon={faCog} className="me-2 text-warning" />
                      System Status
                    </h5>
                    <p className="card-text">All systems operational</p>
                  </div>
                  <div className="card-footer bg-white border-top-0">
                    <Link href="#" className="btn btn-sm btn-outline-warning">Details</Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h4 mb-0">Available Applications</h2>
              <button className="btn btn-sm btn-primary">
                <FontAwesomeIcon icon={faPlus} className="me-1" /> New Application
              </button>
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div className="app-icon me-3 bg-primary text-white">
                        <FontAwesomeIcon icon={faMapMarkedAlt} />
                      </div>
                      <h5 className="card-title mb-0">Henderson Geocode Dashboard</h5>
                    </div>
                    <p className="card-text">Manage locations, generate QR codes, and visualize geographic data for Henderson community development.</p>
                    <div className="d-flex align-items-center small text-muted">
                      <span className="me-3">Last updated: May 2, 2025</span>
                      <span>Status: <span className="text-success">Active</span></span>
                    </div>
                  </div>
                  <div className="card-footer bg-white border-top-0 d-flex justify-content-between">
                    <Link href="/" className="btn btn-primary">Launch</Link>
                    <div>
                      <button className="btn btn-sm btn-outline-secondary me-2">Settings</button>
                      <button className="btn btn-sm btn-outline-secondary">Analytics</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="card h-100 shadow-sm bg-light">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div className="app-icon me-3 bg-secondary text-white">
                        <FontAwesomeIcon icon={faUsers} />
                      </div>
                      <h5 className="card-title mb-0">Community Engagement Portal</h5>
                    </div>
                    <p className="card-text">Manage community events, volunteer opportunities, and engagement metrics for neighborhood initiatives.</p>
                    <div className="d-flex align-items-center small text-muted">
                      <span className="me-3">Coming soon</span>
                      <span>Status: <span className="text-secondary">In Development</span></span>
                    </div>
                  </div>
                  <div className="card-footer bg-light border-top-0 d-flex justify-content-between">
                    <button className="btn btn-secondary" disabled>Coming Soon</button>
                    <div>
                      <button className="btn btn-sm btn-outline-secondary me-2" disabled>Settings</button>
                      <button className="btn btn-sm btn-outline-secondary" disabled>Analytics</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="card h-100 shadow-sm bg-light">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div className="app-icon me-3 bg-success text-white">
                        <FontAwesomeIcon icon={faLeaf} />
                      </div>
                      <h5 className="card-title mb-0">Community Chiller & Boiler Systems</h5>
                    </div>
                    <p className="card-text">Implement shared community chillers and boilers to cut energy costs by more than half, reduce maintenance, and increase reliability.</p>
                    <div className="d-flex align-items-center small text-muted">
                      <span className="me-3">Coming Q3 2025</span>
                      <span>Status: <span className="text-secondary">Planned</span></span>
                    </div>
                  </div>
                  <div className="card-footer bg-light border-top-0 d-flex justify-content-between">
                    <button className="btn btn-secondary" disabled>Coming Soon</button>
                    <div>
                      <button className="btn btn-sm btn-outline-secondary me-2" disabled>Settings</button>
                      <button className="btn btn-sm btn-outline-secondary" disabled>Analytics</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="card h-100 shadow-sm bg-light">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div className="app-icon me-3 bg-warning text-white">
                        <FontAwesomeIcon icon={faSolarPanel} />
                      </div>
                      <h5 className="card-title mb-0">On-Demand, Renewable Energy</h5>
                    </div>
                    <p className="card-text">Shift to energy-on-demand, solar, and battery storage to regulate usage, decrease costs, and sell excess energy back to the grid.</p>
                    <div className="d-flex align-items-center small text-muted">
                      <span className="me-3">Coming Q4 2025</span>
                      <span>Status: <span className="text-secondary">Planned</span></span>
                    </div>
                  </div>
                  <div className="card-footer bg-light border-top-0 d-flex justify-content-between">
                    <button className="btn btn-secondary" disabled>Coming Soon</button>
                    <div>
                      <button className="btn btn-sm btn-outline-secondary me-2" disabled>Settings</button>
                      <button className="btn btn-sm btn-outline-secondary" disabled>Analytics</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="card h-100 shadow-sm bg-light">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div className="app-icon me-3 bg-info text-white">
                        <FontAwesomeIcon icon={faCity} />
                      </div>
                      <h5 className="card-title mb-0">Multi-Purpose, People-Centered Downtown</h5>
                    </div>
                    <p className="card-text">Reimagine downtown as a tech-forward, pedestrian-friendly hub with underused rooftops as green spaces or gathering areas.</p>
                    <div className="d-flex align-items-center small text-muted">
                      <span className="me-3">Coming Q1 2026</span>
                      <span>Status: <span className="text-secondary">Planned</span></span>
                    </div>
                  </div>
                  <div className="card-footer bg-light border-top-0 d-flex justify-content-between">
                    <button className="btn btn-secondary" disabled>Coming Soon</button>
                    <div>
                      <button className="btn btn-sm btn-outline-secondary me-2" disabled>Settings</button>
                      <button className="btn btn-sm btn-outline-secondary" disabled>Analytics</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="card h-100 shadow-sm bg-light">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div className="app-icon me-3 bg-primary text-white">
                        <FontAwesomeIcon icon={faWifi} />
                      </div>
                      <h5 className="card-title mb-0">Smart City Connectivity</h5>
                    </div>
                    <p className="card-text">Use smart city technology to connect buildings, parks, and public spaces to tell the stories of Henderson's people and history.</p>
                    <div className="d-flex align-items-center small text-muted">
                      <span className="me-3">Coming Q2 2026</span>
                      <span>Status: <span className="text-secondary">Planned</span></span>
                    </div>
                  </div>
                  <div className="card-footer bg-light border-top-0 d-flex justify-content-between">
                    <button className="btn btn-secondary" disabled>Coming Soon</button>
                    <div>
                      <button className="btn btn-sm btn-outline-secondary me-2" disabled>Settings</button>
                      <button className="btn btn-sm btn-outline-secondary" disabled>Analytics</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 mb-4">
                <div className="card h-100 shadow-sm bg-light border border-2 border-info border-opacity-25">
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className="badge bg-info text-white">Featured</span>
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div className="app-icon me-3 bg-info text-white">
                        <FontAwesomeIcon icon={faVrCardboard} />
                      </div>
                      <h5 className="card-title mb-0">Holographic Heritage Virtual Tour</h5>
                    </div>
                    <p className="card-text">Dr. Aal-Anubia's innovative platform for preserving Henderson's history through 2D/3D virtual environments, QR-accessible historical narratives, and geocoded landmarks.</p>
                    <div className="d-flex align-items-center small text-muted">
                      <span className="me-3">Coming Q3 2025</span>
                      <span>Status: <span className="text-info">In Development</span></span>
                    </div>
                    <div className="mt-3">
                      <div className="d-flex align-items-center mb-2">
                        <FontAwesomeIcon icon={faHistory} className="text-info me-2" />
                        <small className="text-muted">Preserve Henderson's History and Heroes</small>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <FontAwesomeIcon icon={faLandmark} className="text-info me-2" />
                        <small className="text-muted">Geocoded Historical Landmarks</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faMapMarkedAlt} className="text-info me-2" />
                        <small className="text-muted">Next-Gen Tourism Destination</small>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer bg-light border-top-0 d-flex justify-content-between">
                    <button className="btn btn-info text-white" disabled>Coming Soon</button>
                    <div>
                      <button className="btn btn-sm btn-outline-info me-2" disabled>Preview</button>
                      <button className="btn btn-sm btn-outline-secondary" disabled>Details</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-light py-4 mt-5">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <p className="mb-0">
                  &copy; 2025 Magnetic Lighthouse Community Development Corporation
                </p>
              </div>
              <div className="col-md-6 text-md-end">
                <a href="#" className="text-decoration-none me-3">Privacy Policy</a>
                <a href="#" className="text-decoration-none me-3">Terms of Service</a>
                <a href="#" className="text-decoration-none">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .platform-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        main {
          flex: 1;
        }
        
        .app-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        
        .card {
          transition: transform 0.2s, box-shadow 0.2s;
          border-radius: 8px;
          overflow: hidden;
          border: none;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
        
        .btn-primary {
          background-color: #3a86ff;
          border-color: #3a86ff;
        }
        
        .btn-primary:hover {
          background-color: #2a75ef;
          border-color: #2a75ef;
        }
        
        .text-primary {
          color: #3a86ff !important;
        }
        
        .bg-primary {
          background-color: #3a86ff !important;
        }
      `}</style>
    </>
  );
}
