import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

// Ensure directories exist
const contactsDir = path.join(process.cwd(), 'public/contacts');
const contactAssetsDir = path.join(process.cwd(), 'public/contact_assets');

// Create directories if they don't exist
function ensureDirectoriesExist() {
  if (!fs.existsSync(contactsDir)) {
    fs.mkdirSync(contactsDir, { recursive: true });
  }
  if (!fs.existsSync(contactAssetsDir)) {
    fs.mkdirSync(contactAssetsDir, { recursive: true });
  }
}

export default async function handler(req, res) {
  ensureDirectoriesExist();

  if (req.method === 'GET') {
    try {
      // Read all contact files
      const files = await fsPromises.readdir(contactsDir);
      const contactFiles = files.filter(file => file.endsWith('.json'));
      
      // Read each contact file
      const contacts = await Promise.all(
        contactFiles.map(async (file) => {
          const filePath = path.join(contactsDir, file);
          const fileContent = await fsPromises.readFile(filePath, 'utf8');
          return JSON.parse(fileContent);
        })
      );
      
      return res.status(200).json({ contacts });
    } catch (error) {
      console.error('Error reading contacts:', error);
      return res.status(500).json({ error: 'Failed to read contacts' });
    }
  } else if (req.method === 'POST') {
    try {
      const { contact, filename, profileImage } = req.body;
      
      if (!contact || !filename) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Create a copy of the contact object to avoid modifying the original
      const contactToSave = { ...contact };
      
      // Handle profile image if provided
      if (profileImage) {
        // Generate a unique filename for the image
        const imageFilename = `${Date.now()}_${contact.firstName.toLowerCase()}_${contact.lastName.toLowerCase()}.jpg`;
        contactToSave.profileImage = imageFilename;
        
        try {
          // Extract base64 data (remove the data:image/jpeg;base64, part)
          const base64Data = profileImage.split(',')[1];
          const imagePath = path.join(contactAssetsDir, imageFilename);
          
          // Save the image
          await fsPromises.writeFile(imagePath, base64Data, 'base64');
        } catch (imageError) {
          console.error('Error saving profile image:', imageError);
          // Continue even if image save fails
        }
      }
      
      // Save contact data to JSON file
      const contactPath = path.join(contactsDir, filename);
      await fsPromises.writeFile(contactPath, JSON.stringify(contactToSave, null, 2));
      
      return res.status(200).json({ success: true, message: 'Contact saved successfully' });
    } catch (error) {
      console.error('Error saving contact:', error);
      return res.status(500).json({ error: 'Failed to save contact' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Increase the body size limit for the API route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb', // Limit increased to accommodate base64 encoded images
    },
  },
};
