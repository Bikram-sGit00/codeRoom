import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./RoomPage.css";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css"; // dark theme
import Post from "./Post";

export default function RoomPage() {
  const { roomId: slug } = useParams();
  const [messages, setMessages] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    Prism.highlightAll();
  }, [messages]);

  const handlePostSubmit = async (data) => {
    const newMsg = {
      user: data.name || "anon",
      text: data.message || "",
      code: data.code || "",
      lang: data.lang || "cpp", // Prism supports cpp, js, python, etc.
    };

    setMessages((m) => [...m, newMsg]);

    try {
      await fetch(`${API_BASE}/rooms/${slug}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg),
      });
    } catch (err) {
      console.error("Message send failed:", err);
    }

    setShowPostForm(false);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert("Code copied!");
  };

  return (
    <div className="room-container">
      <main className="post-area">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`post-box ${m.user === "anon" ? "me" : "other"}`}
          >
            <div className="post-header">
              <div className="profile-icon">👤</div>
              <span className="post-user">
                {m.user} – {m.text}
              </span>
            </div>

            {m.code && (
              <div className="code-card">
                <div className="code-card-header">
                  <span>
                    Code – {m.lang.toUpperCase()} – {m.code.split("\n").length}{" "}
                    lines
                  </span>
                  <button
                    className="copy-btn"
                    onClick={() => copyCode(m.code)}
                  >
                    📋
                  </button>
                </div>
                <pre className="code-content">
                  <code className={`language-${m.lang}`}>
                    {m.code}
                  </code>
                </pre>
              </div>
            )}
          </div>
        ))}
      </main>

      <footer className="chat-input-bar">
        <button onClick={() => setShowPostForm(true)} className="post-btn">
          Post Code ✈️
        </button>
      </footer>

      {showPostForm && (
        <Post onSubmit={handlePostSubmit} />
      )}
    </div>
  );
}
