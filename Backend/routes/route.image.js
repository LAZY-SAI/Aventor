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
const imgRoute = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY
});

//  Upload image to Cloudinary
imgRoute.post("/uploads/destination", upload.single("file"), async (req, res) => {
  const token = req.headers.authorization;

  try {
    console.log("=== IMAGE UPLOAD REQUEST ===");
    console.log("File received:", !!req.file);

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'yatrika/destinations',  // Organize in folders
            resource_type: 'auto',

          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
      );

      // Send the buffer to Cloudinary
      uploadStream.end(req.file.buffer);
    });

    console.log(" Image uploaded to Cloudinary");
    console.log("URL:", result.secure_url);

    // Return the Cloudinary URL
    res.status(200).json({
      fileUrl: result.secure_url,        // Full HTTPS URL
      fileName: result.public_id,        // Cloudinary ID

    });

  } catch (error) {
    console.error("❌ IMAGE UPLOAD ERROR:");
    console.error(error);

    res.status(500).json({
      message: "Failed to upload image",
      error: error.message
    });
  }
});

export default imgRoute