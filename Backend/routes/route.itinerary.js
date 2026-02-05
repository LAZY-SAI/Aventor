import { Router } from "express";
import dotenv from "dotenv";
import axios from "axios";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const BACKEND = process.env.BACKEND_URL;

const itineraryRoute = Router();

// Create new itinerary
itineraryRoute.post("/create/itinerary", async (req, res) => {
  const token = req.headers.authorization;
  const body = req.body;

  console.log("=== CREATE ITINERARY REQUEST ===");
  console.log("Backend URL:", BACKEND);
  console.log("Token:", token ? "Present" : "Missing");
  console.log("Request Body:", JSON.stringify(body, null, 2));

  // Validation
  if (!token) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  if (!body.title || !body.totalDays) {
    return res.status(400).json({ 
      message: "Title and total days are required fields" 
    });
  }

  try {

    const payload = {
      title: body.title,
      description: body.description || "",
      theme: body.theme || "",
      totalDays: parseInt(body.totalDays),
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      estimatedBudget: body.estimatedBudget ? parseFloat(body.estimatedBudget) : 0,
    };

    console.log("Sending payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(
      `${BACKEND}/api/v1/admin/itineraries`,
      payload,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Success! Response:", response.status, response.data);

    res.status(200).json({
      message: "Itinerary created successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("=== ERROR DETAILS ===");
    console.error("Status:", error.response?.status);
    console.error("Error Data:", error.response?.data);
    console.error("Error Message:", error.message);

    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || "Something went wrong";

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
itineraryRoute.get("/itinerary/:id", async (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;

  if (!token) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  try {
    const response = await axios.get(`${BACKEND}/itineraries/${id}`, {
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
itineraryRoute.put("/itinerary/:id", async (req, res) => {
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
itineraryRoute.delete("/itinerary/:id", async (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;

  if (!token) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  try {
    const response = await axios.delete(`${BACKEND}/itineraries/${id}`, {
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