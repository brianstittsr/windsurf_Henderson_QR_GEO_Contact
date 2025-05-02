import fs from 'fs';
import path from 'path';

// Path to data.json file
const dataFilePath = path.join(process.cwd(), 'public', 'data.json');

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

export default function handler(req, res) {
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
        const data = readDataFile();
        const newLocation = req.body;
        
        // Check if location already exists
        if (data.results.some(item => item.place_id === newLocation.place_id)) {
          return res.status(409).json({ error: 'Location already exists' });
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
