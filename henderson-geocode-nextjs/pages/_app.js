import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import { useEffect } from 'react';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { GoogleMapsProvider } from '../components/GoogleMapsProvider';

// Prevent Font Awesome from adding its CSS since we did it manually above
config.autoAddCss = false;

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Import Bootstrap JS only on the client side
    import('bootstrap/dist/js/bootstrap');
  }, []);

  return (
    <GoogleMapsProvider>
      <Component {...pageProps} />
    </GoogleMapsProvider>
  );
}

export default MyApp;
