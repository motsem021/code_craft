// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import articleRoutes from "./routes/articleRoutes.js";

// Load .env automatically from project root
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Static file serving (optional, for audio & uploads)
app.use("/audio", express.static("uploads/audio"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/articles", articleRoutes); // ✅ RESTful: /articles/generate, /articles/:id, etc.

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/ai_content_generator", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Start server
const PORT = 5000;
console.log("🔑 Key loaded?", 5000? "Yes" : "No");

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
