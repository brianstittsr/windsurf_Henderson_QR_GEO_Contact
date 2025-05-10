// Static data - this will always be available in the API
let locationsData = {
  "results": [
    {
      "address_components": [
        {
          "long_name": "213-215",
          "short_name": "213-215",
          "types": ["street_number"]
        },
        {
          "long_name": "South Garnett Street",
          "short_name": "S Garnett St",
          "types": ["route"]
        },
        {
          "long_name": "Henderson",
          "short_name": "Henderson",
          "types": ["locality", "political"]
        },
        {
          "long_name": "Vance County",
          "short_name": "Vance County",
          "types": ["administrative_area_level_2", "political"]
        },
        {
          "long_name": "North Carolina",
          "short_name": "NC",
          "types": ["administrative_area_level_1", "political"]
        },
        {
          "long_name": "United States",
          "short_name": "US",
          "types": ["country", "political"]
        },
        {
          "long_name": "27536",
          "short_name": "27536",
          "types": ["postal_code"]
        }
      ],
      "formatted_address": "213-215 S Garnett St, Henderson, NC 27536, USA",
      "geometry": {
        "location": {
          "lat": 36.326337,
          "lng": -78.403765
        },
        "location_type": "ROOFTOP",
        "viewport": {
          "northeast": {
            "lat": 36.3276859,
            "lng": -78.4024160
          },
          "southwest": {
            "lat": 36.3249881,
            "lng": -78.4051139
          }
        }
      },
      "facility_name": "First National Bank Building",
      "place_id": "ChIJN87riHCFreIRb8VKl5u7KAs",
      "plus_code": {
        "compound_code": "QH3Q+G6 Henderson, NC, USA",
        "global_code": "87B4QH3Q+G6"
      },
      "historical_info": {
        "year_built": "1915",
        "architectural_style": "Neoclassical",
        "historical_significance": "One of Henderson's most significant early 20th century commercial buildings",
        "recent_developments": {
          "date": "2018",
          "note": "Underwent restoration to preserve the historic facade while modernizing interior spaces."
        }
      },
      "wikipedia_info": {
        "summary": "The First National Bank Building is a historic bank building located in downtown Henderson, North Carolina. Built in 1915, it exemplifies the Neoclassical architectural style popular for financial institutions of that era.",
        "architects": {
          "primary": "The building was designed by Charles C. Hartmann, a prominent North Carolina architect who designed many significant buildings throughout the state in the early 20th century."
        },
        "building_context": "The First National Bank Building served as an important financial hub for Henderson during the early 20th century when the city was experiencing significant growth due to the tobacco and textile industries. The building's prominent location on South Garnett Street reflects its importance to the commercial development of downtown Henderson."
      },
      "details": {
        "phone": "(252) 555-1234",
        "website": "https://www.hendersonnc.gov/historic-sites",
        "hours": "Mon-Fri: 9am-5pm, Sat: 10am-2pm, Sun: Closed",
        "description": "The First National Bank Building now houses various offices and serves as an important landmark in Henderson's historic downtown district. Visitors can appreciate the preserved architectural details including the ornate cornice, classical columns, and decorative stonework that exemplify early 20th century bank architecture."
      }
    },
    {
      "formatted_address": "304 S Garnett St, Henderson, NC 27536, USA",
      "geometry": {
        "location": {
          "lat": 36.325337,
          "lng": -78.403865
        },
        "location_type": "ROOFTOP"
      },
      "facility_name": "Henderson City Hall",
      "place_id": "ChIJN87riHCFreIRb8VKl5u7KA2"
    }
  ]
};

import fs from 'fs/promises'; // For asynchronous file operations
import path from 'path';

// Configure API to accept JSON requests
export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      // Return all locations from our static data
      try {
        // Add CORS headers to allow requests from any origin
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        // Return the static data
        res.status(200).json(locationsData);
      } catch (error) {
        console.error('Error in GET handler:', error);
        res.status(500).json({ error: 'Failed to fetch locations' });
      }
      break;
      
    case 'POST':
      // Dynamically geocode, enrich, and add new location
      try {
        const { address, facility_name: inputFacilityName } = req.body;

        if (!address) {
          return res.status(400).json({ error: 'Address is required' });
        }

        const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
        if (!apiKey) {
          console.error('Google Geocoding API key is missing.');
          return res.status(500).json({ error: 'Server configuration error: Missing Geocoding API key' });
        }

        // 1. Geocode the address
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();

        if (geocodeData.status !== 'OK' || !geocodeData.results || geocodeData.results.length === 0) {
          console.error('Geocoding failed:', geocodeData);
          return res.status(400).json({ error: 'Failed to geocode address', details: geocodeData.status });
        }

        const geoResult = geocodeData.results[0];
        const facilityNameForWikipedia = inputFacilityName || geoResult.address_components.find(c => c.types.includes('establishment') || c.types.includes('point_of_interest'))?.long_name || geoResult.formatted_address;

        // 2. Enrich with Wikipedia data
        let wikipediaInfo = {
          summary: 'No Wikipedia information found or an error occurred.',
        };
        try {
          const wikipediaUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&redirects=1&titles=${encodeURIComponent(facilityNameForWikipedia)}`;
          const wikipediaResponse = await fetch(wikipediaUrl);
          const wikipediaData = await wikipediaResponse.json();
          const pages = wikipediaData.query.pages;
          const pageId = Object.keys(pages)[0];

          if (pageId && pages[pageId].extract) {
            wikipediaInfo.summary = pages[pageId].extract;
            // You could add more structured data extraction here if needed
            // For example, trying to parse architects, build dates etc. would be more complex
          }
        } catch (wikiError) {
          console.warn('Wikipedia enrichment failed:', wikiError);
          // Non-critical, so we proceed without Wikipedia data or with the default message
        }

        // 3. Create and add the new location object
        const newLocation = {
          address_components: geoResult.address_components,
          formatted_address: geoResult.formatted_address,
          geometry: geoResult.geometry,
          facility_name: inputFacilityName || facilityNameForWikipedia, // Use provided name or inferred
          place_id: geoResult.place_id || `custom_${Date.now()}`, // Ensure a unique ID
          plus_code: geoResult.plus_code,
          types: geoResult.types,
          historical_info: { /* Placeholder, could be expanded or part of Wikipedia enrichment */ },
          wikipedia_info: wikipediaInfo,
          details: { /* Placeholder for contact, etc. */ }
        };

        locationsData.results.push(newLocation); // Keep updating in-memory for current session

        // 4. Persist to data.json
        const dataFilePath = path.resolve(process.cwd(), 'data/data.json');
        try {
          let existingData = { results: [] }; // Default structure if file doesn't exist or is empty
          try {
            const fileContent = await fs.readFile(dataFilePath, 'utf8');
            if (fileContent.trim() !== '') { // Check if file is not empty
                 existingData = JSON.parse(fileContent);
                 if (!Array.isArray(existingData.results)) { // Ensure 'results' is an array
                    console.warn('data.json does not have a valid results array. Resetting.');
                    existingData.results = [];
                 }
            }
          } catch (readError) {
            if (readError.code !== 'ENOENT') { // ENOENT means file doesn't exist, which is fine for the first time
              console.error('Error reading data.json:', readError);
              // Decide if you want to throw or continue with an empty 'results' array
            }
          }
          
          existingData.results.push(newLocation);
          await fs.writeFile(dataFilePath, JSON.stringify(existingData, null, 2), 'utf8');
          console.log('Successfully appended to data.json');

        } catch (fileError) {
          console.error('Error writing to data.json:', fileError);
          // Log the error but don't let it fail the API response for the in-memory addition
          // The client will still get a 201 for the in-memory update.
        }
        
        // Add CORS headers for the response
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        res.status(201).json({
          success: true,
          message: 'Location added and enriched successfully',
          data: newLocation
        });

      } catch (error) {
        console.error('Error in POST handler:', error);
        res.status(500).json({ error: 'Failed to process location' });
      }
      break;
      
    case 'DELETE':
      try {
        const { place_id } = req.query; // Expect place_id from query params

        if (!place_id) {
          return res.status(400).json({ error: 'place_id is required for deletion' });
        }

        // 1. Remove from in-memory locationsData
        const initialInMemoryCount = locationsData.results.length;
        locationsData.results = locationsData.results.filter(loc => loc.place_id !== place_id);
        const inMemoryDeleted = locationsData.results.length < initialInMemoryCount;

        // 2. Remove from data.json
        const dataFilePath = path.resolve(process.cwd(), 'data/data.json');
        let fileDeleted = false;
        try {
          const fileContent = await fs.readFile(dataFilePath, 'utf8');
          let existingData = JSON.parse(fileContent);
          
          if (Array.isArray(existingData.results)) {
            const initialFileCount = existingData.results.length;
            existingData.results = existingData.results.filter(loc => loc.place_id !== place_id);
            fileDeleted = existingData.results.length < initialFileCount;

            if (fileDeleted) {
              await fs.writeFile(dataFilePath, JSON.stringify(existingData, null, 2), 'utf8');
              console.log(`Successfully removed place_id ${place_id} from data.json`);
            }
          }
        } catch (fileError) {
          console.error(`Error processing data.json for deletion of ${place_id}:`, fileError);
          // If file operation fails, we still report success if in-memory was deleted
          // but client should be aware that persistent deletion might have failed.
          if (inMemoryDeleted) {
             res.status(200).json({ success: true, message: `Location ${place_id} deleted from memory, but error updating data.json.` });
             return;
          }
          return res.status(500).json({ error: 'Failed to update data.json' });
        }

        if (!inMemoryDeleted && !fileDeleted) {
          return res.status(404).json({ error: `Location with place_id ${place_id} not found.` });
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.status(200).json({ success: true, message: `Location ${place_id} deleted successfully.` });

      } catch (error) {
        console.error('Error in DELETE handler:', error);
        res.status(500).json({ error: 'Failed to delete location' });
      }
      break;

    default:
      // Set CORS headers for 405 Method Not Allowed as well
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
