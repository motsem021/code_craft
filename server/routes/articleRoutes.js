import express from "express";
import { createArticle, getArticles, getArticle,getLastArticle } from "../controllers/articleController.js";

const router = express.Router();

router.post("/generate", createArticle);
router.get("/", getArticles);
router.get("/last", getLastArticle);   // remove 'articles' prefix
router.get("/:id", getArticle);        


export default router;
