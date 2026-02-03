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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const BACKEND = process.env.BACKEND_URL;
const destRoute = Router();

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// // 👇  Upload image to Cloudinary
// destRoute.post("/uploads/destination", upload.single("file"), async (req, res) => {
//   const token = req.headers.authorization;

//   try {
//     console.log("=== IMAGE UPLOAD REQUEST ===");
//     console.log("File received:", !!req.file);

//     if (!req.file) {
//       return res.status(400).json({ message: "File is required" });
//     }

//     // Upload to Cloudinary
//     const result = await new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//           {
//             folder: 'yatrika/destinations',  // Organize in folders
//             resource_type: 'auto',

//           },
//           (error, result) => {
//             if (error) {
//               console.error("Cloudinary upload error:", error);
//               reject(error);
//             } else {
//               resolve(result);
//             }
//           }
//       );

//       // Send the buffer to Cloudinary
//       uploadStream.end(req.file.buffer);
//     });

//     console.log(" Image uploaded to Cloudinary");
//     console.log("URL:", result.secure_url);

//     // Return the Cloudinary URL
//     res.status(200).json({
//       fileUrl: result.secure_url,        // Full HTTPS URL
//       fileName: result.public_id,        // Cloudinary ID

//     });

//   } catch (error) {
//     console.error("❌ IMAGE UPLOAD ERROR:");
//     console.error(error);

//     res.status(500).json({
//       message: "Failed to upload image",
//       error: error.message
//     });
//   }
// });

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

// Get all destinations
destRoute.get("/destinations", async (req, res) => {
  const token = req.headers.authorization;
  try {
    const response = await axios.get(`${BACKEND}/api/destinations`, {
      headers: { Authorization: token },
    });
    res.status(200).json(response.data);
  } catch (error) {
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

// Update destination (NO CHANGES)
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

// Delete destination
destRoute.delete("/delete/destination/:id", async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization;

  try {
    const response = await axios.delete(`${BACKEND}/api/destinations/${id}`, {
      headers: { Authorization: token },
    });
    res.status(200).json({
      message: "Successfully deleted",
      data: response.data
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: "Failed to delete destination"
    });
  }
});

export default destRoute;