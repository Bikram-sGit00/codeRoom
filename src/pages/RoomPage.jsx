import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./RoomPage.css";

export default function RoomPage() {
  const { roomId: slug } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    // Demo hardcoded messages (replace with fetch later)
    setMessages([
      { user: "Alice", text: "Hey, welcome!" },
      { user: "Bob", text: "Hello everyone 👋" },
      { user: "anon", text: "Nice to meet you guys" },
    ]);

    // Real API
    // fetch(`${API_BASE}/rooms/${slug}/messages`)
    //   .then(r => r.json())
    //   .then(setMessages);
  }, [slug]);

  const send = async () => {
    if (!text.trim()) return;

    const newMsg = { user: "anon", text };
    setMessages((m) => [...m, newMsg]);
    setText("");

    try {
      await fetch(`${API_BASE}/rooms/${slug}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg),
      });
    } catch (err) {
      console.error("Message send failed:", err);
    }
  };

  return (
    <div className="room-container">
      {/* Header */}
      <header className="room-header">
        <h1>{slug} Room 📚</h1>
      </header>

      {/* Messages */}
      <main className="chat-area">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`chat-bubble ${m.user === "anon" ? "me" : "other"}`}
          >
            <span className="chat-text">{m.text}</span>
            <span className="chat-user">{m.user}</span>
          </div>
        ))}
      </main>

      {/* Input */}
      <footer className="chat-input-bar">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
        />
        <button onClick={send}>
          Post Code{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon-paper-plane"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </footer>
    </div>
  );
}
