

import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
import Article from "../models/Article.js";
import User from "../models/Data.js";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import gTTS from "gtts";
import fs from "fs";
import path from "path";

// Init Groq LLM
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
});

const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful AI writing assistant."],
  [
    "user",
    "Write a well-structured article (introduction, body, and conclusion) about: {topic}",
  ],
]);

const chain = promptTemplate.pipe(llm);

// ✅ Create article (generate content + audio + link user)
export const createArticle = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    // Find last registered user
    const lastUser = await User.findOne()
      .sort({ createdAt: -1 })
      .select("_id name email");

    if (!lastUser) {
      return res.status(404).json({ message: "No users found" });
    }

    // Generate article text
    const result = await chain.invoke({ topic: prompt });
    const content = result.content;

    // Save article to MongoDB
    const article = new Article({ prompt, content, user: lastUser._id });
    await article.save();

    // Generate audio file
    const speech = new gTTS(content, "en"); // change "en" to "ar" if needed
    const audioDir = path.join("uploads", "audio");
    const audioFile = path.join(audioDir, `${article._id}.mp3`);

    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    speech.save(audioFile, async (err) => {
      if (err) {
        console.error("❌ Error generating audio:", err);
      } else {
        console.log(`✅ Audio saved: ${audioFile}`);
        article.audioPath = audioFile;
        await article.save();
      }
    });

    await article.populate("user", "name email");
    res.status(201).json(article);
  } catch (error) {
    console.error("Error generating article:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all articles
export const getArticles = async (req, res) => {
  try {
    const articles = await Article.find().populate("user", "name email");
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Get last article
export const getLastArticle = async (req, res) => {
  try {
    const article = await Article.findOne().sort({ createdAt: -1 }).populate("user", "name email");
    if (!article) return res.status(404).json({ error: "No articles found" });
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get article by ID
export const getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate("user", "name email");
    if (!article) return res.status(404).json({ error: "Not found" });
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

