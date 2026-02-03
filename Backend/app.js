import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import useRoute from "./routes/route.user.js";
import destRoute from "./routes/route.destination.js";
import adminRoute from "./routes/route.admin.js";
import authRoute from "./routes/route.auth.js"
import imgRoute from "./routes/route.image.js";
import itineraryRoute from "./routes/route.itinerary.js"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(helmet({
  crossOriginEmbedderPolicy:true,
  crossOriginResourcePolicy:{ policy: "cross-origin" }
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)
app.use('/api/uploads/destinations', express.static(
  path.join(__dirname, 'uploads/destination'),
  {
    setHeaders: (res, filePath) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
));
const corsOptions = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use("/", useRoute);
app.use("/", destRoute);
app.use("/", adminRoute);
app.use("/",imgRoute);
app.use("/", authRoute);
app.use("/", itineraryRoute)
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
