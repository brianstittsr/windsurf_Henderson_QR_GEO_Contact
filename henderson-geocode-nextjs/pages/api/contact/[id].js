import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Contact ID is required' });
  }
  
  const contactsDir = path.join(process.cwd(), 'public/contacts');
  const contactAssetsDir = path.join(process.cwd(), 'public/contact_assets');
  
  // Ensure directories exist
  if (!fs.existsSync(contactsDir)) {
    fs.mkdirSync(contactsDir, { recursive: true });
  }
  if (!fs.existsSync(contactAssetsDir)) {
    fs.mkdirSync(contactAssetsDir, { recursive: true });
  }
  
  // Handle GET request (fetch a specific contact)
  if (req.method === 'GET') {
    try {
      const filePath = path.join(contactsDir, `${id}.json`);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      
      const fileContent = await fsPromises.readFile(filePath, 'utf8');
      const contact = JSON.parse(fileContent);
      
      return res.status(200).json({ contact });
    } catch (error) {
      console.error('Error reading contact:', error);
      return res.status(500).json({ error: 'Failed to read contact' });
    }
  }
  
  // Handle PUT request (update a contact)
  else if (req.method === 'PUT') {
    try {
      const { contact, profileImage } = req.body;
      
      if (!contact) {
        return res.status(400).json({ error: 'Contact data is required' });
      }
      
      const filePath = path.join(contactsDir, `${id}.json`);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      
      // Read existing contact to preserve QR code if not regenerated
      const existingContent = await fsPromises.readFile(filePath, 'utf8');
      const existingContact = JSON.parse(existingContent);
      
      // Merge existing contact with updated data
      const updatedContact = {
        ...existingContact,
        ...contact,
        updatedAt: new Date().toISOString()
      };
      
      // Save updated contact data
      await fsPromises.writeFile(filePath, JSON.stringify(updatedContact, null, 2));
      
      // Handle profile image update if provided
      if (profileImage && contact.profileImage) {
        // Extract base64 data
        const base64Data = profileImage.split(',')[1];
        const imagePath = path.join(contactAssetsDir, contact.profileImage);
        
        // Save the image
        await fsPromises.writeFile(imagePath, base64Data, 'base64');
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Contact updated successfully',
        contact: updatedContact
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      return res.status(500).json({ error: 'Failed to update contact' });
    }
  }
  
  // Handle DELETE request (delete a contact)
  else if (req.method === 'DELETE') {
    try {
      const filePath = path.join(contactsDir, `${id}.json`);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      
      // Read contact to get profile image filename
      const fileContent = await fsPromises.readFile(filePath, 'utf8');
      const contact = JSON.parse(fileContent);
      
      // Delete contact file
      await fsPromises.unlink(filePath);
      
      // Delete profile image if it exists
      if (contact.profileImage) {
        const imagePath = path.join(contactAssetsDir, contact.profileImage);
        if (fs.existsSync(imagePath)) {
          await fsPromises.unlink(imagePath);
        }
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Contact deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      return res.status(500).json({ error: 'Failed to delete contact' });
    }
  }
  
  else {
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
