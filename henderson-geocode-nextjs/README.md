# Henderson Geocode Next.js Application

A Next.js application for managing Henderson, NC location data with geocoding, QR code generation, and interactive maps.

## Features

- Single address geocoding using Google Maps API
- Interactive map of Henderson, NC with location markers
- QR code generation for each location
- Form to add new locations that updates the data.json file
- Responsive design with Bootstrap

## Getting Started

### Prerequisites

- Node.js (use your preferred node version manager)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd henderson-geocode-nextjs
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `public` directory and copy your existing data.json file into it:
```bash
mkdir -p public
cp ../geocode-lookup/data.json public/
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/pages` - Next.js pages including API routes
  - `/api/locations.js` - API endpoint for managing location data
  - `/index.js` - Dashboard page
  - `/add-location.js` - Form for adding new locations
  - (other pages to be implemented)
- `/components` - Reusable React components
- `/public` - Static files including data.json
- `/styles` - CSS styles

## How It Works

1. The application reads and writes to a data.json file stored in the public directory
2. When adding a new location, the form:
   - Geocodes the address using Google Maps API
   - Generates a preview with a map and QR code
   - Saves the data to the data.json file via the API endpoint
3. The data is then available for the map view and QR codes page

## API Routes

- `GET /api/locations` - Get all locations
- `POST /api/locations` - Add a new location

## Next Steps

To complete the application, implement:

1. The map page (`/pages/map.js`) to display all locations
2. The QR codes page (`/pages/qrcodes.js`) to display QR codes for all locations
3. The facility detail page (`/pages/facility/[id].js`) to display detailed information

## License

This project is open source and available under the MIT License.
