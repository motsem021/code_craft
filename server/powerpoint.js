import express from "express";
import PptxGenJS from "pptxgenjs";
import fs from "fs";
import mongoose from "mongoose";
import Article from "./models/Article.js";

// Create express app
const app = express();
app.use(express.json());

// -----------------------------
// ✅ Connect to MongoDB
// -----------------------------
mongoose
  .connect("mongodb://127.0.0.1:27017/ai_content_generator", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("📦 MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // stop if DB fails
  });

// -----------------------------
// ✅ Route: Generate PPT
// -----------------------------
app.get("/generate-ppt", async (req, res) => {
  try {
    const articleDoc = await Article.findOne()
      .sort({ createdAt: -1 });

    if (!articleDoc)
      return res.status(404).json({ error: "No articles found" });

    const title = articleDoc.prompt || "Generated Presentation";
    const article = articleDoc.content;
    const sections = article.split("\n\n").filter((s) => s.trim() !== "");

    let pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_16x9";

    // Cover slide
    let cover = pptx.addSlide();
    cover.addShape("rect", {
      x: 0,
      y: 0,
      w: "100%",
      h: "100%",
      fill: { color: "003366" },
    });
    cover.addText(title, {
      x: 1,
      y: 2,
      w: 8,
      h: 1,
      fontSize: 40,
      bold: true,
      color: "FFFFFF",
      align: "center",
    });
    cover.addText(`By: ${articleDoc.user?.name || "Anonymous"}`, {
      x: 1,
      y: 3.5,
      w: 8,
      h: 0.7,
      fontSize: 20,
      italic: true,
      color: "DDDDDD",
      align: "center",
    });

    // Content slides
    sections.forEach((section, i) => {
      let slide = pptx.addSlide();
      let [slideTitle, ...content] = section.split("\n");

      slide.addShape("rect", {
        x: 0,
        y: 0,
        w: "100%",
        h: 1,
        fill: { color: "003366" },
      });
      slide.addText(slideTitle, {
        x: 0.5,
        y: 0.2,
        w: 9,
        h: 0.8,
        fontSize: 26,
        bold: true,
        color: "FFFFFF",
      });

      slide.addText(content.join("\n"), {
        x: 0.7,
        y: 1.3,
        w: 8.5,
        h: 4.5,
        fontSize: 20,
        color: "333333",
        bullet: true,
        lineSpacing: 28,
      });

      slide.addText(`Page ${i + 1}`, {
        x: 8.5,
        y: 6.5,
        fontSize: 12,
        color: "888888",
        align: "right",
      });
    });

    // Closing slide
    let closing = pptx.addSlide();
    closing.addShape("rect", {
      x: 0,
      y: 0,
      w: "100%",
      h: "100%",
      fill: { color: "003366" },
    });
    closing.addText("Thank You!", {
      x: 1,
      y: 2.5,
      w: 8,
      h: 1,
      fontSize: 36,
      bold: true,
      color: "FFFFFF",
      align: "center",
    });

    // Save PPTX
    const fileName = "Article_Presentation.pptx";
    await pptx.writeFile(fileName);

    res.download(fileName, (err) => {
      if (err) {
        console.error("❌ Download error:", err);
      } else {
        console.log("✅ File sent successfully");
        fs.unlinkSync(fileName);
      }
    });
  } catch (err) {
    console.error("❌ Route error:", err);
    res.status(500).json({ error: "Failed to generate presentation" });
  }
});
app.get("/ping", (req, res) => {
  res.send("Server is alive ✅");
});
// -----------------------------
// ✅ Keep server alive + log errors
// -----------------------------
const PORT = 7000;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);

// Catch hidden errors
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});
