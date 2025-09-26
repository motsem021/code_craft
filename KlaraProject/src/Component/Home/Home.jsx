import React from "react";
import "./Home.css";
import { Link } from "react-router-dom";
import robotImg from "./robot.jpg";
import bookImg from "./book.jpg";
import logo from "./Logo.jpg";

export default function Dashboard({ user, setUser }) {
  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="home-dashboard">
      {/* Sidebar */}
      <aside className="home-sidebar">
        <div className="home-logo">
          <Link to={"/home"}><img src={logo} alt="Logo" /></Link>
          <h2>Klara Echo</h2>
        </div>
        <ul>
          <li><Link to={'/home'}>📊 Dashboard</Link></li>
          <li><Link to={"/generate"}>📝 Generate Article</Link></li>
          <li><Link to={"/save"}>📂 My Articles</Link></li>
          
        </ul>
        {user && (
          <button onClick={handleLogout} className="home-logout-btn">
            Logout
          </button>
        )}
      </aside>

      <main className="home-main-content">
        <div className="home-page-header">
          <h1>Dashboard</h1>

          {/* لو المستخدم مسجل دخول */}
          {user ? (
            <div className="home-user-profile">
              <div className="home-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span>{user.name}</span>
            </div>
          ) : (
            <div className="home-auth-links">
              <Link to="/login">Log in</Link>
              <Link to="/signup">Sign up</Link>
            </div>
          )}
        </div>

        <div className="home-cards">
          <div className="home-card">
            <img src={robotImg} alt="Generate Articles" />
            <h3>✍ Generate articles</h3>
            <p>Write a topic and get an AI-written article</p>
            <button className="home-start-btn"><Link to={"/generate"}>Start</Link></button>
          </div>
          <div className="home-card">
            <img src={bookImg} alt="My Articles" />
            <h3>📑 My articles</h3>
            <p>View and edit your saved articles</p>
            <button className="home-view-btn"><Link to={"/save"}>My Articles</Link></button>
          </div>
        </div>
      </main>
    </div>
  );
}
