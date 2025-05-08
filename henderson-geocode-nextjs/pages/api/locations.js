import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import formidable from 'formidable';

// Check if running in production (Vercel)
const isProduction = process.env.NODE_ENV === 'production';

// Path to data.json file
const dataFilePath = path.join(process.cwd(), 'public', 'data.json');
const facilityImagesDir = path.join(process.cwd(), 'public', 'facility_images');

// Store the request object for use in readDataFile
let requestObj = null;

// Helper function to read the data file
async function readDataFile() {
  if (isProduction) {
    // In production (Vercel), fetch the data.json file from the public URL
    try {
      // Construct the URL based on Vercel's environment
      let baseUrl;
      
      if (process.env.VERCEL_URL) {
        // Use Vercel's deployment URL
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else if (requestObj?.headers?.host) {
        // Fallback to request host if available
        baseUrl = `https://${requestObj.headers.host}`;
      } else {
        // Final fallback - this should be replaced with your actual Vercel domain
        baseUrl = 'https://henderson-geocode-nextjs.vercel.app';
      }
      
      console.log(`Fetching data.json from ${baseUrl}/data.json`);
      const response = await fetch(`${baseUrl}/data.json`);
      
      if (!response.ok) {
        console.error(`Failed to fetch data.json: ${response.status}`);
        // Return fallback data if fetch fails
        return {
          "results": [
            {
              "formatted_address": "213-215 S Garnett St, Henderson, NC 27536, USA",
              "geometry": {
                "location": {
                  "lat": 36.326337,
                  "lng": -78.403765
                }
              },
              "facility_name": "First National Bank Building",
              "place_id": "ChIJN87riHCFreIRb8VKl5u7KAs"
            }
          ]
        };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching data.json:', error);
      // Return fallback data on error
      return {
        "results": [
          {
            "formatted_address": "213-215 S Garnett St, Henderson, NC 27536, USA",
            "geometry": {
              "location": {
                "lat": 36.326337,
                "lng": -78.403765
              }
            },
            "facility_name": "First National Bank Building",
            "place_id": "ChIJN87riHCFreIRb8VKl5u7KAs"
          }
        ]
      };
    }
  } else {
    // In development, read from the filesystem
    if (!fs.existsSync(dataFilePath)) {
      // Create default structure if file doesn't exist
      const defaultData = { results: [] };
      fs.writeFileSync(dataFilePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    
    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(fileData);
  }
}

// Helper function to write to the data file
function writeDataFile(data) {
  const dirPath = path.dirname(dataFilePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

// Disable the default body parser to handle form data with files
export const config = {
  api: {
    bodyParser: false,
  },
};

// Ensure the facility images directory exists
if (!fs.existsSync(facilityImagesDir)) {
  fs.mkdirSync(facilityImagesDir, { recursive: true });
}

// Parse form data including files
const parseForm = async (req) => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

export default async function handler(req, res) {
  // Store the request object for use in readDataFile
  requestObj = req;
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      // Return all locations
      try {
        const data = await readDataFile();
        res.status(200).json(data);
      } catch (error) {
        console.error('Error in GET handler:', error);
        res.status(500).json({ error: 'Failed to fetch locations' });
      }
      break;
      
    case 'POST':
      // Add a new location
      try {
        // Parse the form data
        const { fields, files } = await parseForm(req);
        
        // Parse the JSON string back to an object
        const newLocation = JSON.parse(fields.locationData);
        
        // Read existing data
        const data = await readDataFile();
        
        // Check if location already exists
        if (data.results.some(item => item.place_id === newLocation.place_id)) {
          return res.status(409).json({ error: 'Location already exists' });
        }
        
        // Handle facility image if uploaded
        if (files.facilityImage) {
          const file = files.facilityImage;
          const fileExt = path.extname(file.originalFilename || 'image.jpg');
          const fileName = `${newLocation.place_id}${fileExt}`;
          const imagePath = path.join(facilityImagesDir, fileName);
          
          // Read the file and save it to the facility_images directory
          const fileData = await fsPromises.readFile(file.filepath);
          await fsPromises.writeFile(imagePath, fileData);
          
          // Add image path to location data
          newLocation.image = `/facility_images/${fileName}`;
        }
        
        // Add new location
        data.results.push(newLocation);
        writeDataFile(data);
        
        res.status(201).json({ success: true, location: newLocation });
      } catch (error) {
        console.error('Error adding location:', error);
        res.status(500).json({ error: 'Failed to add location' });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
