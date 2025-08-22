// RoomPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./RoomPage.css";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import Post from "./Post";

export default function RoomPage() {
  const { roomId: slug } = useParams();
  const [messages, setMessages] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/rooms/${slug}/messages?t=${Date.now()}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [slug]);

  useEffect(() => {
    Prism.highlightAll();
  }, [messages]);

  // ✅ FIX: send `name` + `message` exactly as backend expects
  const handlePostSubmit = async ({ name, message, code, lang }) => {
    const payload = {
      name: name?.trim() || "anon",
      message: message?.trim() || "",
      code: code || "",
      lang: lang || "cpp",
    };

    try {
      const res = await fetch(`${API_BASE}/api/rooms/${slug}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchMessages();
        setShowPostForm(false);
      } else {
        console.error("❌ Failed to save message");
      }
    } catch (err) {
      console.error("❌ Message send failed:", err);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).catch((err) => {
      console.error("❌ Copy failed:", err);
    });
  };

  return (
    <div className="room-container">
      <main className="post-area">
        {messages.map((m, i) => (
          <div key={i} className="post-box">
            <div className="post-header">
              <div className="profile-icon">👤</div>
              <span className="post-user">
                <strong>{m.user}</strong> – {m.text}
              </span>
            </div>

            {m.code && (
              <div className="code-card">
                <div className="code-card-header">
                  <div className="mac-dots">
                    <span className="dot red"></span>
                    <span className="dot yellow"></span>
                    <span className="dot green"></span>
                  </div>
                  <span>
                    {m.lang?.toUpperCase()} – {m.code.split("\n").length} lines
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

      {showPostForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <Post onSubmit={handlePostSubmit} />
          </div>
        </div>
      )}
    </div>
  );
}
