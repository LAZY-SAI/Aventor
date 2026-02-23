import {Router} from "express";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url"
const admindash = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });
const BACKEND = process.env.BACKEND_URL 
admindash.get(`/admin`, async (req, res) => {
    const token = req.headers.authorization
  try {
    const response = await axios.get(`${BACKEND}/api/admin/stats`, {
      headers: {
        Authorization: token,
        "BACKEND-skip-browser-warning": "true",
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "failed to fetch data" });
  }
});

export default admindash;
