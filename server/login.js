import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/User.js";       // add .js extension
import authMiddleware from "./middleware/auth.js"; // add .js extension

dotenv.config();


const app = express();
app.use(express.json());
app.use(cookieParser());

// Conection MongoDb
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// Routes
app.use("", authRoutes);

app.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: `Welcome ${req.user.email} to the dashboard ` });
});

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
