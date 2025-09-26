import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "./Logo.jpg";
import "./Ai_Generate.css";

export default function Ai_Generate({ user, handleLogout }) {
  const [topic, setTopic] = useState("");
  const [length, setLength] = useState("Short");
  const [language, setLanguage] = useState("English");
  const [result, setResult] = useState("");

  const [loading, setLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState("idle");
  const [saveStatus, setSaveStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // ===== Generate article and display last article =====
  const handleGenerate = async () => {
    if (!topic.trim()) {
      setErrorMessage("⚠️ Please enter a topic first.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setResult("");

    try {
      // 1️⃣ Generate new article
      const generateRes = await fetch("http://localhost:5000/articles/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: topic, length, language }),
      });

      const generateData = await generateRes.json();
      if (!generateRes.ok) throw new Error(generateData.message || "Error generating article");

      // 2️⃣ Fetch last article
      const lastRes = await fetch("http://localhost:5000/articles/last");
      const lastData = await lastRes.json();
      if (!lastRes.ok) throw new Error(lastData.error || "Error fetching last article");

      setResult(lastData.content || lastData.article || "No content");
      setTopic(lastData.title || "");
      setLength(lastData.length || "Short");
      setLanguage(lastData.language || "English");

    } catch (err) {
      setErrorMessage(err.message || "❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ===== Copy to clipboard =====
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

  // ===== Save to localStorage =====
  const handleSave = () => {
    if (!result) return;
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

  return (
    <div className="ai-layout">
      {/* Sidebar */}
      <aside className="home-sidebar">
        <div className="home-logo">
          <img src={logo} alt="Logo" />
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

      {/* Main */}
      <main className="ai-page">
        <div className="ai-card">
          <h2 className="ai-title">Generate New Article</h2>

          <input
            placeholder="Enter your article topic..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="ai-topic-input"
          />

          {errorMessage && <p className="ai-error">{errorMessage}</p>}

          <div className="ai-options">
            <div className="ai-option-group">
              <label>Article Length</label>
              <select value={length} onChange={(e) => setLength(e.target.value)}>
                <option>Short</option>
                <option>Medium</option>
                <option>Long</option>
              </select>
            </div>

            <div className="ai-option-group">
              <label>Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option>English</option>
                <option>Arabic</option>
                <option>French</option>
              </select>
            </div>
          </div>

          <button
            className="ai-generate-btn"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate"}
          </button>

          <div className="ai-result">
            <h3>Article Result</h3>
            <div className="ai-result-box">{result || "..."}</div>

            <div className="ai-actions">
              <button onClick={handleSave}>
                {saveStatus === "saved" ? "✅ Saved!" : "Save"}
              </button>
              <button onClick={handleCopy}>
                {copyStatus === "copied" ? "✅ Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
