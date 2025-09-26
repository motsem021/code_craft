import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "./Logo.jpg";
import "./My_Articles.css";

export default function My_Articles({ user, handleLogout }) {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const key = "klara_articles";
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    setArticles(saved);
  }, []);

  // 🗑️ حذف المقال
  const handleDelete = (id) => {
    const key = "klara_articles";
    const updated = articles.filter(article => article.id !== id);
    setArticles(updated); // تحديث في الصفحة
    localStorage.setItem(key, JSON.stringify(updated)); // تحديث في localStorage
  };

  return (
    <div className="ai-layout">
      {/* ===== Sidebar ===== */}
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

      {/* ===== Main Content ===== */}
      <main className="ai-page">
        <div className="ai-card">
          <h2 className="ai-title">My Articles</h2>

          <div className="articles-grid">
            {articles.length === 0 ? (
              <p>No saved articles yet.</p>
            ) : (
              articles.map(article => (
                <div key={article.id} className="article-card">
                  <div className="article-header">
                    <h3>{article.title}</h3>
                    <span className="category-badge">{article.language}</span>
                  </div>
                  <p className="article-date">
                    {new Date(article.createdAt).toLocaleString()}
                  </p>
                  <p className="article-content">{article.content}</p>

                  {/* زرار الحذف */}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(article.id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
