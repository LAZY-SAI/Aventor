import { Router } from "express";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const BACKEND = process.env.BACKEND_URL;
const destRoute = Router();


const extractPublicId = (imageUrl) => {
  try {
    
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) return null;
    
  
    let pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
    
  
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
    

    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

// Helper function to delete images from Cloudinary
const deleteCloudinaryImages = async (images) => {
  const deletionResults = [];
  
  for (const image of images) {
    try {
      let publicId;
      
     
      if (image.publicId) {
        publicId = image.publicId;
      } else if (image.imageUrl) {

        publicId = extractPublicId(image.imageUrl);
      }
      
      if (!publicId) {
        console.warn('⚠️ Could not extract public_id from:', image);
        deletionResults.push({ success: false, image, reason: 'No public_id' });
        continue;
      }
      
      console.log(`🗑️ Deleting image from Cloudinary: ${publicId}`);
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        console.log(`✅ Successfully deleted: ${publicId}`);
        deletionResults.push({ success: true, publicId });
      } else {
        console.warn(`⚠️ Cloudinary deletion warning for ${publicId}:`, result);
        deletionResults.push({ success: false, publicId, result });
      }
    } catch (error) {
      console.error('❌ Error deleting image from Cloudinary:', error);
      deletionResults.push({ success: false, image, error: error.message });
    }
  }
  
  return deletionResults;
};


// Create destination with image URL 
destRoute.post("/create/destinations", async (req, res) => {
  const token = req.headers.authorization;
  console.log("=== SENDING TO BACKEND ===");
  console.log("Image URL being sent:", req.body.images[0].imageUrl);
  try {
    console.log("=== CREATE DESTINATION REQUEST ===");

    const requiredFields = ['name', 'country', 'province', 'district', 'municipality', 'latitude', 'longitude'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    if (!req.body.images || !Array.isArray(req.body.images) || req.body.images.length === 0) {
      return res.status(400).json({
        message: "At least one image is required. Please upload an image first."
      });
    }

    const response = await axios.post(
        `${BACKEND}/api/destinations`,
        req.body,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
        }
    );

    console.log("✅ Destination created successfully");
    res.status(200).json(response.data);

  } catch (error) {
    console.error("❌ CREATE DESTINATION ERROR:");

    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", JSON.stringify(error.response.data, null, 2));

      res.status(error.response.status).json({
        message: error.response.data.message || "Failed to create destination",
        error: error.response.data
      });
    } else if (error.request) {
      console.error("No response:", error.message);
      res.status(503).json({
        message: "Backend not responding",
        error: error.message
      });
    } else {
      console.error("Setup error:", error.message);
      res.status(500).json({
        message: "Request failed",
        error: error.message
      });
    }
  }
});

// Get all destinations with pagination (Size 50)
destRoute.get("/destinations", async (req, res) => {
  const token = req.headers.authorization;
  
 
  const { page = 0, size = 50, sortBy = 'name', sortDirection = 'ASC' } = req.query;

  try {
    const response = await axios.get(`${BACKEND}/api/destinations`, {
      headers: { Authorization: token },
      params: {
        page,
        size,
        sortBy,
        sortDirection
      }
    });
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ FETCH ERROR:", error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Failed to fetch destinations"
    });
  }
});

// Get destination by id
destRoute.get("/destinations/:id", async (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;

  try {
    const response = await axios.get(`${BACKEND}/api/destinations/${id}`, {
      headers: { Authorization: token },
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: "Failed to fetch destination"
    });
  }
});

// Update destination 
destRoute.put("/update/destinations/:id", async (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;

  try {
    console.log("=== UPDATE DESTINATION ===");
    console.log("ID:", id);

    const response = await axios.put(
        `${BACKEND}/api/destinations/${id}`,
        req.body,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token
          },
        }
    );

    console.log("✅ UPDATE SUCCESS");
    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ UPDATE ERROR:");
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", JSON.stringify(error.response.data, null, 2));
    }

    res.status(error.response?.status || 400).json({
      message: error.response?.data?.message || error.message,
      error: error.response?.data
    });
  }
});

// Delete destination with Cloudinary image cleanup
destRoute.delete("/delete/destination/:id", async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization;

  try {
    console.log("=== DELETE DESTINATION ===");
    console.log("ID:", id);

   
    console.log("📥 Fetching destination data...");
    const destinationResponse = await axios.get(
      `${BACKEND}/api/destinations/${id}`,
      {
        headers: { Authorization: token },
      }
    );

    const destination = destinationResponse.data;
    console.log("Destination data received");

  
    if (destination.images && Array.isArray(destination.images) && destination.images.length > 0) {
      console.log(`🗑️ Deleting ${destination.images.length} images from Cloudinary...`);
      const deletionResults = await deleteCloudinaryImages(destination.images);
      
      const successCount = deletionResults.filter(r => r.success).length;
      console.log(`✅ Deleted ${successCount}/${destination.images.length} images from Cloudinary`);
    } else {
      console.log("ℹ️ No images to delete from Cloudinary");
    }

   
    console.log("🗑️ Deleting destination from database...");
    const response = await axios.delete(
      `${BACKEND}/api/destinations/${id}`,
      {
        headers: { Authorization: token },
      }
    );

    console.log("✅ Destination and images deleted successfully");
    res.status(200).json({
      message: "Successfully deleted destination and associated images",
      data: response.data
    });

  } catch (error) {
    console.error("❌ DELETE ERROR:");
    
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", JSON.stringify(error.response.data, null, 2));
      
      res.status(error.response.status).json({
        message: error.response?.data?.message || "Failed to delete destination",
        error: error.response.data
      });
    } else {
      console.error("Error:", error.message);
      res.status(500).json({
        message: "Failed to delete destination",
        error: error.message
      });
    }
  }
});

destRoute.get('/search/geocode',async(req,res)=>{
  const {address} =  req.query
  try{
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`,{
        params:{
          q:address,
          format:'json',
          limit:1
        },
        headers:{
          "User-Agent":"Yatrika/1.0"
        }
      })
      if (response.data.length > 0) {
            const { lat, lon, display_name } = response.data[0];
            res.json({ lat, lon, address: display_name });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
  }
  catch(error)
  {
    console.error(error)
  }
})

destRoute.get("/destination/name",async(req,res)=>{
  const token = req.headers.authorization
  try{
    const response = await axios.get(`${BACKEND}/api/destinations/by-name`,
      {
        headers:{
          Authorization:token
        }
      }
    )
    res.status(201).json(response.data)
  }
  catch(error)
  {
    console.error("Error:", error.message);
      res.status(500).json({
        message: "Failed to delete destination",
        error: error.message
      });
  }
})

export default destRoute;