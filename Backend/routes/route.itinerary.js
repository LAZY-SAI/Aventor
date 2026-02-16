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

// ✅ Create axios instance with better configuration
const apiClient = axios.create({
  timeout: 60000, // 60 seconds
  maxRedirects: 5,
  headers: {
    'Connection': 'keep-alive',
    'Keep-Alive': 'timeout=60',
  }
});

// ✅ Add retry logic for failed requests
const retryRequest = async (requestFn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      const isLastRetry = i === retries - 1;
      const isRetryableError = 
        error.code === 'ECONNRESET' || 
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNABORTED';
      
      if (isLastRetry || !isRetryableError) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, i), 5000);
      console.log(`Retry attempt ${i + 1}/${retries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

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

    // Find the JSON Blob and Image File
    const dataPart = req.files?.find(f => f.fieldname === 'data');
    const filePart = req.files?.find(f => f.fieldname === 'files');

    // Handle JSON Data
    if (dataPart) {
      const jsonBlob = new Blob([dataPart.buffer], { type: 'application/json' });
      form.append("data", jsonBlob);
    } else if (req.body.data) {
      const jsonBlob = new Blob([req.body.data], { type: 'application/json' });
      form.append("data", jsonBlob);
    }

    // Handle Image File
    if (filePart) {
      const imageBlob = new Blob([filePart.buffer], { type: filePart.mimetype });
      form.append("files", imageBlob, filePart.originalname);
    }

    console.log("📤 Sending itinerary creation request...");
    console.log("🎯 URL:", `${BACKEND}/api/v1/admin/itineraries/with-images`);

    // ✅ Use retry logic
    const response = await retryRequest(async () => {
      return await apiClient.post(
        `${BACKEND}/api/v1/admin/itineraries/with-images`,
        form,
        {
          headers: {
            Authorization: token,
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );
    });

    console.log("✅ Itinerary created successfully");
    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Itinerary Creation Error:");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error("Response:", error.response?.data);
    
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        message: "Backend connection failed. Please check if the backend server is running and accessible.",
        error: error.message 
      });
    }
    
    res.status(error.response?.status || 500).json(
      error.response?.data || { message: "Internal Proxy Error", error: error.message }
    );
  }
});

// Add items to itinerary
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
    console.log("📤 Sending add items request...");
    
    // ✅ Use retry logic
    const response = await retryRequest(async () => {
      return await apiClient.post(
        `${BACKEND}/api/v1/admin/itineraries/${id}/items`,
        body,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );
    });

    console.log("✅ Items added successfully");
    res.status(200).json({
      message: "Items added to itinerary successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("❌ Add Items Error:");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error("Response:", error.response?.data);
    
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        message: "Backend connection failed. Please check if the backend server is running.",
        error: error.message 
      });
    }
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || "Failed to add items";
    
    res.status(statusCode).json({
      message: errorMessage,
      details: error.response?.data,
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
    const response = await retryRequest(async () => {
      return await apiClient.get(
        `${BACKEND}/api/v1/itineraries/admin-templates`,
        {
          headers: {
            Authorization: token,
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );
    });

    res.status(200).json({
      message: "Itineraries fetched successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error fetching itineraries:", error.response?.data || error.message);
    
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        message: "Backend connection failed",
        error: error.message 
      });
    }
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || "Failed to fetch itineraries";

    res.status(statusCode).json({
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get destinations
itineraryRoute.get("/destinations", async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  try {
    console.log("📤 Fetching destinations...");
    
    const response = await retryRequest(async () => {
      return await apiClient.get(
        `${BACKEND}/api/v1/destinations`, // Adjust this endpoint as needed
        {
          headers: {
            Authorization: token,
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );
    });

    console.log("✅ Destinations fetched successfully");
    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Fetch Destinations Error:");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        message: "Backend connection failed",
        error: error.message 
      });
    }
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || "Failed to fetch destinations";

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
    const response = await retryRequest(async () => {
      return await apiClient.get(
        `${BACKEND}/api/v1/itineraries/${id}`,
        {
          headers: {
            Authorization: token,
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );
    });
  
    res.status(200).json({
      message: "Itinerary fetched successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error fetching itinerary:", error.response?.data || error.message);
    
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        message: "Backend connection failed",
        error: error.message 
      });
    }
    
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

    const response = await retryRequest(async () => {
      return await apiClient.put(
        `${BACKEND}/itineraries/${id}`,
        payload,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );
    });

    res.status(200).json({
      message: "Itinerary updated successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error updating itinerary:", error.response?.data || error.message);
    
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        message: "Backend connection failed",
        error: error.message 
      });
    }
    
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
    const response = await retryRequest(async () => {
      return await apiClient.delete(
        `${BACKEND}/api/v1/admin/itineraries/${id}`,
        {
          headers: {
            Authorization: token,
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );
    });

    res.status(200).json({
      message: "Itinerary deleted successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error deleting itinerary:", error.response?.data || error.message);
    
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        message: "Backend connection failed",
        error: error.message 
      });
    }
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || "Failed to delete itinerary";

    res.status(statusCode).json({
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default itineraryRoute;