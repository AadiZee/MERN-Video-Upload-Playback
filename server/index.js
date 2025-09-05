import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import connectDB from "./utils/db.utils.js";
import videoRoutes from "./routes/video.routes.js";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 3011;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app.use(cors());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Range"],
    exposedHeaders: ["Content-Range"],
  })
);
app.use(express.json());

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use("/api/vid", videoRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
