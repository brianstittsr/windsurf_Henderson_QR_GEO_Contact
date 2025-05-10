# Henderson GeoCode QR Project

This Next.js application provides a platform for managing and displaying location-based information for Henderson, NC. It allows users to view locations on a map, see detailed information for each facility, generate QR codes that link to these details, and dynamically add or remove locations.

## Features

*   **Interactive Map View**: Displays all listed locations on a Google Map.
*   **Facility Detail Pages**: Shows enriched information for each location, including address, coordinates, historical data, and Wikipedia summaries.
*   **QR Code Generation**: Generates QR codes for each facility, linking directly to its detail page.
*   **Dynamic Location Management**:
    *   **Add New Locations**: Users can add new locations by providing an address and an optional facility name. The system will:
        *   Geocode the address using the Google Geocoding API.
        *   Enrich the location data with a summary from the Wikipedia API.
        *   Persist the new location data to `data/data.json`.
    *   **Delete Locations**: Users can delete locations from the QR code management page. This action removes the location from the UI and the persistent `data/data.json` file.
*   **Persistent Data Storage**: Location data is stored in a `data.json` file within the project, allowing for data persistence across sessions and deployments.
*   **Responsive Design**: Built with Bootstrap for a responsive user experience across devices.

## Technology Stack

*   **Framework**: [Next.js](https://nextjs.org/) (React Framework)
*   **Language**: JavaScript
*   **Mapping**: [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/overview) (via `@vis.gl/react-google-maps`)
*   **Geocoding**: [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding/overview)
*   **Data Enrichment**: [Wikipedia API](https://www.mediawiki.org/wiki/API:Main_page)
*   **QR Code Generation**: `qrcode.react` library
*   **Styling**: [Bootstrap 5](https://getbootstrap.com/)
*   **Icons**: [Font Awesome](https://fontawesome.com/)
*   **Deployment**: [Vercel](https://vercel.com/)

## Project Structure

```
henderson-geocode-nextjs/
├── components/         # Reusable React components (e.g., Layout, Map)
├── data/
│   └── data.json       # Stores location data persistently
├── pages/
│   ├── api/            # API routes (e.g., locations.js for CRUD operations)
│   ├── facility/
│   │   └── [id].js     # Dynamic route for facility detail pages
│   ├── _app.js         # Custom App component (global styles, layout)
│   ├── index.js        # Dashboard/Home page
│   ├── map.js          # Map view page
│   └── qrcodes.js      # QR code management page
├── public/             # Static assets (e.g., images, favicons)
├── styles/             # Global CSS styles
├── .env.local.example  # Example environment variables file
├── .gitignore
├── next.config.js      # Next.js configuration
├── package.json
└── README.md
```

## Setup and Local Development

1.  **Clone the repository**:
    ```bash
    git clone <your-repository-url>
    cd henderson-geocode-nextjs
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables**:
    *   Create a `.env.local` file in the root of the project by copying `.env.local.example` (if it exists) or creating a new one.
    *   Add your Google Geocoding API key:
        ```
        GOOGLE_GEOCODING_API_KEY=YOUR_ACTUAL_API_KEY_HERE
        ```
    *   You'll also need a Google Maps API key for the map display, typically configured directly in the component or via another environment variable if you choose to refactor.

4.  **Run the development server**:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will be available at `http://localhost:3000`.

## API Endpoints

*   `GET /api/locations`:
    *   Fetches all current locations from the in-memory store (initially loaded from `data/data.json` if the file existed on server start, or dynamically updated).
*   `POST /api/locations`:
    *   Adds a new location.
    *   **Request Body** (JSON):
        ```json
        {
          "address": "123 Main St, Henderson, NC",
          "facility_name": "New City Hall" 
        }
        ```
    *   Geocodes the address, enriches with Wikipedia data, and appends to `data/data.json` and the in-memory store.
*   `DELETE /api/locations?place_id=<place_id>`:
    *   Deletes a location specified by its `place_id`.
    *   Removes the location from `data/data.json` and the in-memory store.

## Deployment to Vercel

This project is configured for easy deployment to Vercel.

1.  **Push your code to GitHub**:
    Ensure your latest changes, including the `data/data.json` file (if you want to deploy its current state), are committed and pushed to your GitHub repository.
    *Make sure `data/data.json` is NOT in your `.gitignore` file if you intend for its contents to be deployed.* 

2.  **Link your GitHub repository to Vercel**:
    *   Sign up or log in to [Vercel](https://vercel.com/).
    *   Import your GitHub repository.
    *   Vercel will automatically detect that it's a Next.js project.

3.  **Configure Environment Variables on Vercel**:
    *   In your Vercel project settings, navigate to "Settings" -> "Environment Variables".
    *   Add the `GOOGLE_GEOCODING_API_KEY` with your API key value.
    *   Ensure it's available for all environments (Production, Preview, Development).

4.  **Deploy**:
    *   Vercel will automatically build and deploy your project when you push to the connected branch (e.g., `main`).
    *   You can also trigger manual deployments from the Vercel dashboard.

**Important Note on Data Persistence with Vercel**: When deployed to Vercel, the `data/data.json` file will be part of your deployment bundle. If your API modifies this file, these modifications will occur on the *ephemeral filesystem* of that specific Vercel instance. 
    *   **Changes made via the API on a deployed Vercel instance will be lost when the instance recycles or a new deployment occurs.** 
    *   For true persistent data storage that survives redeployments and scales, consider integrating a database service (e.g., Vercel KV, Vercel Postgres, Supabase, Firebase, MongoDB Atlas).
    *   The current `data/data.json` setup is best for local development, or if the data is primarily managed by committing changes to the file in Git and redeploying.

## Future Enhancements

*   User authentication for managing locations.
*   Integration with a proper database for robust data persistence.
*   More advanced Wikipedia data extraction (e.g., specific fields like architect, year built).
*   Admin interface for easier location management.
*   Batch import/export of location data.
