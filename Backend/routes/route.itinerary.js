import { Router } from "express";
import dotenv from "dotenv";
import axios from "axios";
import { fileURLToPath } from "url";
import path from "path";
import multer from "multer";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const BACKEND = process.env.BACKEND_URL;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
const itineraryRoute = Router();

// Create new itinerary
itineraryRoute.post("/create/itinerary", upload.any(), async (req, res) => {
  const token = req.headers.authorization;

  try {
    const form = new FormData();

    // 1. Find the JSON Blob (Multer treats Blobs from frontend as files)
    const dataPart = req.files?.find(f => f.fieldname === 'data');
    // 2. Find the Image File
    const filePart = req.files?.find(f => f.fieldname === 'files');

    // Handle JSON Data
    if (dataPart) {
      const jsonBlob = new Blob([dataPart.buffer], { type: 'application/json' });
      form.append("data", jsonBlob);
    } else if (req.body.data) {
      // Fallback if it came through as a regular body field
      const jsonBlob = new Blob([req.body.data], { type: 'application/json' });
      form.append("data", jsonBlob);
    }

    // Handle Image File
    if (filePart) {
      const imageBlob = new Blob([filePart.buffer], { type: filePart.mimetype });
      form.append("files", imageBlob, filePart.originalname);
    }

    const response = await axios.post(
      `${BACKEND}/api/v1/admin/itineraries/with-images`,
      form,
      {
        headers: {
          Authorization: token,
        
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Proxy Error:", error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: "Internal Proxy Error" });
  }
});

// Add items to itinerary based on id
itineraryRoute.post("/itinerary/:id/items", async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization;
  const body = req.body;

  console.log("=== ADD ITEMS REQUEST ===");
  console.log("Itinerary ID:", id);
  console.log("Payload:", JSON.stringify(body, null, 2));
  if (!token) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  try {
    const response = await axios.post(
      `${BACKEND}/api/v1/admin/itineraries/${id}/items`,
      body,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({
      message: "Items added to itinerary successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error adding items:", error.response?.data || error.message);
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || "Failed to add items";
    
    res.status(statusCode).json({
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get all itineraries
itineraryRoute.get("/itineraries", async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  try {
    const response = await axios.get(`${BACKEND}/api/v1/itineraries/admin-templates`, {
      headers: {
        Authorization: token,
      },
    });

    res.status(200).json({
      message: "Itineraries fetched successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error fetching itineraries:", error.response?.data || error.message);
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || "Failed to fetch itineraries";

    res.status(statusCode).json({
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get single itinerary by ID
itineraryRoute.get("/itineraries/:id", async (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;

  if (!token) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  try {
    const response = await axios.get(`${BACKEND}/api/v1/itineraries/${id}`, {
      headers: {
        Authorization: token,
      },
    });
  
    res.status(200).json({
      message: "Itinerary fetched successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error fetching itinerary:", error.response?.data || error.message);
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || "Failed to fetch itinerary";

    res.status(statusCode).json({
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Update itinerary
itineraryRoute.put("/itinerary/:id/items", async (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;
  const body = req.body;

  if (!token) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  try {
    const payload = {
      title: body.title,
      description: body.description || "",
      theme: body.theme || "",
      totalDays: parseInt(body.totalDays),
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      estimatedBudget: body.estimationBudget ? parseFloat(body.estimationBudget) : 0,
    };

    const response = await axios.put(
      `${BACKEND}/itineraries/${id}`,
      payload,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({
      message: "Itinerary updated successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error updating itinerary:", error.response?.data || error.message);
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || "Failed to update itinerary";

    res.status(statusCode).json({
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Delete itinerary
itineraryRoute.delete("/itineraries/:id", async (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;

  if (!token) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  try {
    const response = await axios.delete(`${BACKEND}/api/v1/admin/itineraries/${id}`, {
      headers: {
        Authorization: token,
      },
    });

    res.status(200).json({
      message: "Itinerary deleted successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error deleting itinerary:", error.response?.data || error.message);
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || "Failed to delete itinerary";

    res.status(statusCode).json({
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default itineraryRoute;