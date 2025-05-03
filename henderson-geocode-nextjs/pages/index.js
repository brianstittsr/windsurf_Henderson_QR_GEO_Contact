import Layout from '../components/Layout';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLocationDot, 
  faMapLocationDot, 
  faQrcode, 
  faPlusCircle,
  faAddressBook,
  faAddressCard
} from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  return (
    <Layout title="Magnetic Lighthouse Community Development Corporation Tools Dashboard">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h2 className="mb-4 text-center">Available Tools</h2>
          <div className="d-flex flex-column gap-3 align-items-center">
            <Link href="/geocode" className="tool-link">
              <FontAwesomeIcon icon={faLocationDot} /> Single Address GeoCode Lookup
            </Link>
            <Link href="/map" className="tool-link">
              <FontAwesomeIcon icon={faMapLocationDot} /> Henderson Geocode Demo
            </Link>
            <Link href="/qrcodes" className="tool-link">
              <FontAwesomeIcon icon={faQrcode} /> Henderson QR Codes
            </Link>
            <Link href="/add-location" className="tool-link">
              <FontAwesomeIcon icon={faPlusCircle} /> Add New Henderson Location
            </Link>
            {/* Contact List button hidden per request */}
            {/* Create Contact QR Code button hidden per request */}
          </div>
        </div>
      </div>
    </Layout>
  );
}
