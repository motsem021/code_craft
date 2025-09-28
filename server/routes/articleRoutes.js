import express from "express";
import { 
  createArticle, 
  getArticles, 
  getArticle, 
  getLastArticle, 
  getArticleAudio, 
  getArticleAudioById 
} from "../controllers/articleController.js";

const router = express.Router();

// Create article
router.post("/generate", createArticle);

// Get all articles
router.get("/", getArticles);

// Get last article
router.get("/last", getLastArticle);

// Get last audio
router.get("/audio", getArticleAudio);

// Get audio by article ID
router.get("/:id/audio", getArticleAudioById);

// Get article by ID
router.get("/:id", getArticle);

export default router;
