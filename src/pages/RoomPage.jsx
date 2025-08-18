// RoomPage.jsx
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

  // ✅ Fetch existing messages
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/rooms/${slug}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      } else {
        console.error("❌ Failed to fetch messages");
      }
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [slug]);

  // ✅ highlight code when messages update
  useEffect(() => {
    Prism.highlightAll();
  }, [messages]);

  // ✅ FIX: match backend schema (user + text instead of name + message)
  const handlePostSubmit = async (data) => {
    const payload = {
      user: data.name || "anon",
      text: data.message || "",
      code: data.code || "",
      lang: data.lang || "cpp",
    };

    try {
      const res = await fetch(`${API_BASE}/api/rooms/${slug}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedMsg = await res.json();
        setMessages((prev) => [...prev, savedMsg]); // append new msg
      } else {
        console.error("❌ Failed to save message");
      }
    } catch (err) {
      console.error("❌ Message send failed:", err);
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
                    Code – {m.lang?.toUpperCase()} – {m.code.split("\n").length}{" "}
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
                  <code className={`language-${m.lang}`}>{m.code}</code>
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

      {showPostForm && <Post onSubmit={handlePostSubmit} />}
    </div>
  );
}
