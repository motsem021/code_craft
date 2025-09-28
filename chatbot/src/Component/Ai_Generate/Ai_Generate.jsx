import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "./Logo.jpg";
import "./Ai_Generate.css";
import ChatBot from "../ChatBot/ChatBot";

export default function Ai_Generate({ user, handleLogout }) {
  const [topic, setTopic] = useState("");
  const [length, setLength] = useState("Short");
  const [language, setLanguage] = useState("English");
  const [result, setResult] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
const [isMaximized, setIsMaximized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState("idle");
  const [saveStatus, setSaveStatus] = useState("idle");
  const [showBot, setShowBot] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false); 
  const [showAudio, setShowAudio] = useState(false);
  


  const audioRef = useRef(null);

  // ========== Generate Article ==========
  const handleGenerate = async () => {
    if (!topic) {
      alert("Please enter a topic first.");
      return;
    }

    setLoading(true);
    setResult("Generating...");

    try {
      // 1️⃣ Generate new article
      await fetch("http://localhost:5000/articles/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: topic, length, language }),
      });

      // 2️⃣ Fetch last article
      const lastRes = await fetch("http://localhost:5000/articles/last");
      const lastData = await lastRes.json();
      if (!lastRes.ok) throw new Error(lastData.error || "Error fetching last article");

      setResult(lastData.content || "No content");

      // ✅ set audio from DB if exists
  if (lastData.audioPath) {
  setAudioUrl(`http://localhost:5000${lastData.audioPath}`);
} else {
  setAudioUrl("");
}


    } catch (err) {
      console.error(err);
      alert("❌ " + (err.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  // ========== Copy ==========
  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    } finally {
      setTimeout(() => setCopyStatus("idle"), 1500);
    }
  };

  // ========== Save ==========
  const handleSave = () => {
    if (!result || result.startsWith("❌") || result === "Generating..." || result === "...") {
      alert("⚠️ Cannot save. Please generate a valid article first.");
      return;
    }

    try {
      const key = "klara_articles";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      const newItem = {
        id: Date.now(),
        title: topic || "Untitled",
        content: result,
        length,
        language,
        createdAt: new Date().toISOString(),
      };
      existing.unshift(newItem);
      localStorage.setItem(key, JSON.stringify(existing));
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    } finally {
      setTimeout(() => setSaveStatus("idle"), 1500);
    }
  };
  // ========== Download PPT ==========
const handleDownloadPpt = () => {
  const link = document.createElement("a");
  link.href = "http://localhost:7000/generate-ppt"; // backend route
  link.download = "Article_Presentation.pptx"; // suggested filename
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  return (
    <div className="ai-layout">
      {/* ===== Sidebar ===== */}
      <aside className="home-sidebar">
        <div className="home-logo">
          <Link to={"/home"}><img src={logo} alt="Logo" /></Link>
          <h2>Klara Echo</h2>
        </div>
        <ul>
          <li><Link to="/home">📊 Dashboard</Link></li>
          <li><Link to="/generate">📝 Generate Article</Link></li>
          <li><Link to="/save">📂 My Articles</Link></li>
        </ul>

        {user ? (
          <div className="sidebar-user">
            <div className="avatar-circle">{user.name[0]}</div>
            <span>{user.name}</span>
            <button className="home-logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div className="home-auth-links">
            <Link to="/login">Log in</Link>
            <Link to="/signup">Sign up</Link>
          </div>
        )}
      </aside>

      {/* ===== Main Content ===== */}
      <main className="ai-page">
        <div className="ai-card">
          <h2 className="ai-title">Generate New Article</h2>

          <input
            className="ai-topic-input"
            placeholder="Enter your article topic..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <button
            className="ai-generate-btn"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate"}
          </button>

          {/* ✅ Audio Section */}
{showAudio && audioUrl && (
  <div className="ai-audio">
    <h4>🔊 Article Audio</h4>
    <audio controls>
      <source src={audioUrl} type="audio/mpeg" />
    </audio>
  </div>
)}
          

          <div className="ai-result">
            <h3>Article Result</h3>
            <div className="ai-result-box">{result || "..."}</div>

            <div className="ai-actions">
              <button onClick={handleSave}>
                {saveStatus === "saved" ? "Saved!" : "Save"}
              </button>
              <button onClick={handleCopy}>
                {copyStatus === "copied" ? "Copied!" : "Copy"}
              </button>
              <button 
  onClick={() => setShowAudio(true)} 
  disabled={!audioUrl}
>
  Convert to Audio
</button>
  
  
  <button onClick={handleDownloadPpt}>
    Download PPT
  </button>


            </div>
          </div>
        </div>
      </main>
<div className="chatbot-floating">
        {showBot && (
          <div className={`chatbot-box ${isMaximized ? "maximized" : ""}`}>
            <div className="chatbot-header">
              <span>🤖 ChatBot</span>
              <div className="chatbot-actions">
                <button
                  className="maximize-btn"
                  onClick={() => setIsMaximized(!isMaximized)}
                >
                  {isMaximized ? "🗗" : "🗖"}
                </button>
                <button className="close-btn" onClick={() => setShowBot(false)}>
                  ✖
                </button>
              </div>
            </div>
            <ChatBot article={result} /> {/* هنبعت المقال هنا */}
          </div>
        )}
        <button className="chatbot-toggle" onClick={() => setShowBot(!showBot)}>
          💬
        </button>
      </div>
    </div>   
  );
}