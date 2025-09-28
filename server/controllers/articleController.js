import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
import Article from "../models/Article.js";
import User from "../models/Data.js";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import gTTS from "gtts";
import stream from "stream";

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

    // Create article document first (without audio yet)
    const article = new Article({ prompt, content, user: lastUser._id });
    await article.save();

    // Generate audio as buffer
    const speech = new gTTS(content, "en"); // "ar" if Arabic

    const bufferChunks = [];
    const writable = new stream.Writable({
      write(chunk, encoding, callback) {
        bufferChunks.push(chunk);
        callback();
      },
    });

    // Pipe TTS stream into buffer
    speech.stream().pipe(writable);

    writable.on("finish", async () => {
      try {
        const audioBuffer = Buffer.concat(bufferChunks);
        article.audioData = audioBuffer;
        article.audioContentType = "audio/mpeg"; // since it's MP3
        await article.save();

        console.log("✅ Audio saved in DB");
        await article.populate("user", "name email");

        res.status(201).json(article);
      } catch (err) {
        console.error("❌ Error saving audio in DB:", err);
        res.status(500).json({ error: err.message });
      }
    });
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
// ✅ Get last article
export const getLastArticle = async (req, res) => {
  try {
    const article = await Article.findOne()
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    if (!article) return res.status(404).json({ error: "No articles found" });

    const articleObj = article.toObject();
    if (article.audioData) {
      articleObj.audioPath = `/articles/${article._id}/audio`;
    }

    res.json(articleObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//get audio by id 
export const getArticleAudioById = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article || !article.audioData) {
      return res.status(404).send("Audio not found");
    }

    res.set("Content-Type", article.audioContentType);
    res.send(article.audioData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// get last  audio 
export const getArticleAudio = async (req, res) => {
  try {
    const article = await Article.findOne().sort({ createdAt: -1 }).populate("user", "name email");
    if (!article || !article.audioData) {
      return res.status(404).send("Audio not found");
    }

    res.set("Content-Type", article.audioContentType);
    res.send(article.audioData); // send raw audio buffer
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

