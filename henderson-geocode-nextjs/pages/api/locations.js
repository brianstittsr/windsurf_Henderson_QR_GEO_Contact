import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import formidable from 'formidable';

// Path to data.json file
const dataFilePath = path.join(process.cwd(), 'public', 'data.json');
const facilityImagesDir = path.join(process.cwd(), 'public', 'facility_images');

// Helper function to read the data file
function readDataFile() {
  if (!fs.existsSync(dataFilePath)) {
    // Create default structure if file doesn't exist
    const defaultData = { results: [] };
    fs.writeFileSync(dataFilePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  
  const fileData = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(fileData);
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
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      // Return all locations
      try {
        const data = readDataFile();
        res.status(200).json(data);
      } catch (error) {
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
        const data = readDataFile();
        
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
