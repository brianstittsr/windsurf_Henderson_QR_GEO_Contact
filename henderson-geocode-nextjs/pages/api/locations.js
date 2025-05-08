// Static data - this will always be available in the API
const locationsData = {
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

// Configure API to accept JSON requests
export const config = {
  api: {
    bodyParser: true,
  },
};

export default function handler(req, res) {
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
      // For now, just acknowledge the request but don't actually save anything
      // since we're using static data in production
      try {
        res.status(201).json({ 
          success: true, 
          message: 'Location received, but not saved in production environment'
        });
      } catch (error) {
        console.error('Error in POST handler:', error);
        res.status(500).json({ error: 'Failed to process location' });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
