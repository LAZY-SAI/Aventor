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

const apiClient = axios.create({
  timeout: 60000,
  maxRedirects: 5,
  headers: {
    Connection: "keep-alive",
    "Keep-Alive": "timeout=60",
  },
});

// ─── Ensure time is "HH:MM:SS" string for Java backend ───────────────────────
const toTimeString = (timeVal) => {
  if (!timeVal) return "00:00:00";
  // If it's already an object {hour, minute, second, nano} convert to string
  if (typeof timeVal === "object") {
    const h = String(timeVal.hour || 0).padStart(2, "0");
    const m = String(timeVal.minute || 0).padStart(2, "0");
    const s = String(timeVal.second || 0).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }
  // If "HH:MM" add seconds
  if (typeof timeVal === "string" && timeVal.length === 5) return `${timeVal}:00`;
  // Already "HH:MM:SS"
  return timeVal;
};

const retryRequest = async (requestFn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      const isLastRetry = i === retries - 1;
      const isRetryableError =
        error.code === "ECONNRESET" ||
        error.code === "ETIMEDOUT" ||
        error.code === "ECONNABORTED";
      if (isLastRetry || !isRetryableError) throw error;
      const delay = Math.min(1000 * Math.pow(2, i), 5000);
      console.log(`Retry attempt ${i + 1}/${retries} after ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const itineraryRoute = Router();

// ─── CREATE ITINERARY ────────────────────────────────────────────────────────
itineraryRoute.post("/create/itinerary", upload.any(), async (req, res) => {
  const token = req.headers.authorization;
  try {
    const form = new FormData();
    const dataPart = req.files?.find((f) => f.fieldname === "data");
    const filePart = req.files?.find((f) => f.fieldname === "files");

    if (dataPart) {
      form.append("data", new Blob([dataPart.buffer], { type: "application/json" }));
    } else if (req.body.data) {
      form.append("data", new Blob([req.body.data], { type: "application/json" }));
    }
    if (filePart) {
      form.append("files", new Blob([filePart.buffer], { type: filePart.mimetype }), filePart.originalname);
    }

    const response = await retryRequest(() =>
      apiClient.post(`${BACKEND}/api/v1/admin/itineraries/with-images`, form, {
        headers: { Authorization: token, "ngrok-skip-browser-warning": "true" },
      })
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Create itinerary error:", error.response?.data || error.message);
    if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT") {
      return res.status(503).json({ message: "Backend connection failed.", error: error.message });
    }
    res.status(error.response?.status || 500).json(
      error.response?.data || { message: "Internal Proxy Error" }
    );
  }
});

// ─── ADD ITEMS TO ITINERARY (POST) ───────────────────────────────────────────
itineraryRoute.post("/itinerary/:id/items", async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization;
  const body = req.body;

  console.log("=== ADD ITEMS REQUEST ===");
  console.log("Itinerary ID:", id);
  console.log("Payload:", JSON.stringify(body, null, 2));

  if (!token) return res.status(401).json({ message: "Authorization token required" });

  try {
    const rawItems = body.itineraryItems ? body.itineraryItems : [body];
    const formattedItems = rawItems.map((item) => ({
      destinationId: item.destinationId || null,
      dayNumber: parseInt(item.dayNumber),
      orderInDay: parseInt(item.orderInDay),
      title: item.title,
      notes: item.notes || "",
      activityType: item.activityType || "VISIT",
      isVisited: item.isVisited ?? true,
      estimatedCost: parseFloat(item.estimatedCost) || 0,
      startTime: toTimeString(item.startTime),
      endTime: toTimeString(item.endTime),
    }));

    const payload = formattedItems[0];
    console.log("📤 Final payload to backend:", JSON.stringify(payload, null, 2));

    const response = await retryRequest(() =>
      apiClient.post(`${BACKEND}/api/v1/admin/itineraries/${id}/items`, payload, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })
    );

    res.status(200).json({ message: "Items added successfully", data: response.data });
  } catch (error) {
    console.error("❌ Add Items Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Failed to add items",
      details: error.response?.data,
    });
  }
});

// ─── GET ALL ITINERARIES ──────────────────────────────────────────────────────
itineraryRoute.get("/itineraries", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "Authorization token required" });

  try {
    const response = await retryRequest(() =>
      apiClient.get(`${BACKEND}/api/v1/itineraries/admin-templates`, {
        headers: { Authorization: token, "ngrok-skip-browser-warning": "true" },
      })
    );
    res.status(200).json({ message: "Itineraries fetched successfully", data: response.data });
  } catch (error) {
    console.error("Get itineraries error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Failed to fetch itineraries",
    });
  }
});

// ─── GET DESTINATIONS ─────────────────────────────────────────────────────────
itineraryRoute.get("/destinations", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "Authorization token required" });

  try {
    const response = await retryRequest(() =>
      apiClient.get(`${BACKEND}/api/v1/destinations`, {
        headers: { Authorization: token, "ngrok-skip-browser-warning": "true" },
      })
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Get destinations error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Failed to fetch destinations",
    });
  }
});

// ─── GET SINGLE ITINERARY ─────────────────────────────────────────────────────
itineraryRoute.get("/itineraries/:id", async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "Authorization token required" });

  try {
    const response = await retryRequest(() =>
      apiClient.get(`${BACKEND}/api/v1/itineraries/${id}`, {
        headers: { Authorization: token, "ngrok-skip-browser-warning": "true" },
      })
    );
    res.status(200).json({ message: "Itinerary fetched successfully", data: response.data });
  } catch (error) {
    console.error("Get itinerary error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Failed to fetch itinerary",
    });
  }
});

// ─── UPDATE ITINERARY HEADER ──────────────────────────────────────────────────
itineraryRoute.put("/itineraries/:id", async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization;
  const body = req.body;
  if (!token) return res.status(401).json({ message: "Authorization token required" });

  try {
    const payload = {
      title: body.title,
      description: body.description || "",
      status: body.status || "TEMPLATE",
      theme: body.theme || "",
      totalDays: parseInt(body.totalDays) || 1,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      estimatedBudget: body.estimatedBudget ? parseFloat(body.estimatedBudget) : 0,
      images: body.images || [],
    };

    console.log("Updating header:", JSON.stringify(payload, null, 2));

    const response = await retryRequest(() =>
      apiClient.put(`${BACKEND}/api/v1/admin/itineraries/${id}`, payload, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })
    );
    res.status(200).json({ message: "Itinerary updated successfully", data: response.data });
  } catch (error) {
    console.error("Update itinerary error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Failed to update itinerary",
    });
  }
});

// ─── UPDATE SINGLE ITEM ───────────────────────────────────────────────────────
itineraryRoute.put("/itineraries/:id/items/:itemId", async (req, res) => {
  const { id, itemId } = req.params;
  const token = req.headers.authorization;
  const body = req.body;

  console.log("PUT item body received:", JSON.stringify(body, null, 2));

  if (!token) return res.status(401).json({ message: "Authorization token required" });

  try {
    const payload = {
      destinationId: body.destinationId || null,
      dayNumber: parseInt(body.dayNumber),
      orderInDay: parseInt(body.orderInDay),
      title: body.title,
      notes: body.notes || "",
      startTime: toTimeString(body.startTime),   
      endTime: toTimeString(body.endTime),        
      activityType: body.activityType || "VISIT",
      estimatedCost: parseFloat(body.estimatedCost) || 0,
      isVisited: body.isVisited ?? true,
    };

    console.log("PUT item payload to Java:", JSON.stringify(payload, null, 2));

    const response = await retryRequest(() =>
      apiClient.put(
        `${BACKEND}/api/v1/admin/itineraries/${id}/items/${itemId}`,
        payload,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      )
    );

    console.log("✅ Item updated:", response.data);
    res.status(200).json({ message: "Item updated successfully", data: response.data });
  } catch (error) {
    console.error("❌ Java error status:", error.response?.status);
    console.error("❌ Java error body:", JSON.stringify(error.response?.data, null, 2));
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Failed to update item",
      details: error.response?.data,
    });
  }
});

// ─── DELETE ITINERARY ─────────────────────────────────────────────────────────
itineraryRoute.delete("/itineraries/:id", async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "Authorization token required" });

  try {
    const response = await retryRequest(() =>
      apiClient.delete(`${BACKEND}/api/v1/admin/itineraries/${id}`, {
        headers: { Authorization: token, "ngrok-skip-browser-warning": "true" },
      })
    );
    res.status(200).json({ message: "Itinerary deleted successfully", data: response.data });
  } catch (error) {
    console.error("Delete itinerary error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Failed to delete itinerary",
    });
  }
});

export default itineraryRoute;