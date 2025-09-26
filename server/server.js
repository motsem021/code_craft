import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import articleRoutes from "./routes/articleRoutes.js";

// Load .env automatically from project root
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/audio", express.static("uploads/audio"));
app.use("/", articleRoutes); 
// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/ai_content_generator", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Routes
app.use("/articles", articleRoutes);

const PORT = process.env.PORT || 5000;
console.log("🔑 Key loaded?", process.env.GROQ_API_KEY ? "Yes" : "No");

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
