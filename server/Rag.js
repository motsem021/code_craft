import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { ChatGroq } from "@langchain/groq";
import Article from "./models/Article.js";
import { pipeline } from "@xenova/transformers";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Initialize Grok chat client

const chatClient = new ChatGroq({
  apiKey: process.env.GROK_API_KEY,
  model: "llama-3.1-8b-instant"  // 👈 required!
});


// Initialize embedding model and start server after it loads
(async () => {
  console.log("Loading local embedding model...");
  const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  console.log("Embedding model loaded!");

  // ----------------- Chat / RAG endpoint -----------------
 app.post("/chat", async (req, res) => {
  try {
    const { query } = req.body || {};
    if (!query) return res.status(400).json({ error: "Missing query" });

    // Fetch the last article
    let lastArticle = await Article.findOne().sort({ createdAt: -1 });
    if (!lastArticle) return res.status(404).json({ error: "No articles found" });

    // Generate embedding if missing
    if (!lastArticle.embedding || !lastArticle.embedding.length) {
      const embeddingTensor = await embedder(lastArticle.content);

      let flattened;
      if (embeddingTensor.data) {
        flattened = Array.from(embeddingTensor.data);
      } else if (Array.isArray(embeddingTensor)) {
        flattened = embeddingTensor.flat(Infinity);
      } else {
        throw new Error("Unknown embedding format");
      }

      lastArticle.embedding = flattened;
      await lastArticle.save();
    }

    // 🔹 Prompt Groq with the article + query
    const prompt = `
You are an assistant. Use the following article to answer the user query or perform edits (delete/insert lines):

Article:
${lastArticle.content}

User Query:
${query}

Respond concisely.
    `;

const gptResponse = await chatClient.invoke(
  [
    { role: "system", content: "You are a helpful AI assistant." },
    { role: "user", content: prompt }
  ],
  {
    model: "llama-3.1-8b-instant"
  }
);

console.log("🔍 Full GPT Response:", JSON.stringify(gptResponse, null, 2));

const answer = Array.isArray(gptResponse.content)
  ? gptResponse.content.map(c => c.text || "").join(" ")
  : gptResponse.content || "No answer generated";

res.json({
  articleId: lastArticle._id,
  content: lastArticle.content,
  answer
});


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


  // Start server after model is loaded
  const PORT = 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
