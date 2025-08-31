// RoomPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState, createContext } from "react";
import "./RoomPage.css";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import Post from "./Post";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-python";

const ThemeContext = createContext();

export default function RoomPage() {
  const { roomId: slug } = useParams();
  const [messages, setMessages] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);

  // ✅ Add theme state + persist to localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  // Optional toggle (if you need button later)
  // const toggleTheme = () => {
  //   const newTheme = theme === "light" ? "dark" : "light";
  //   setTheme(newTheme);
  //   localStorage.setItem("theme", newTheme);
  // };

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

  // ✅ Wrap UI in ThemeContext.Provider
  return (
    <div className={`room-container ${theme}`}>
  {/* your room page JSX */}


    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`room-container ${theme}`}>
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
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.79331 13.125C6.41444 13.125 6.09375 12.9938 5.83125 12.7313C5.56875 12.4688 5.4375 12.1481 5.4375 11.7692V3.23081C5.4375 2.85194 5.56875 2.53125 5.83125 2.26875C6.09375 2.00625 6.41444 1.875 6.79331 1.875H13.0817C13.4606 1.875 13.7812 2.00625 14.0438 2.26875C14.3063 2.53125 14.4375 2.85194 14.4375 3.23081V11.7692C14.4375 12.1481 14.3063 12.4688 14.0438 12.7313C13.7812 12.9938 13.4606 13.125 13.0817 13.125H6.79331ZM6.79331 12H13.0817C13.1394 12 13.1923 11.9759 13.2403 11.9278C13.2884 11.8798 13.3125 11.8269 13.3125 11.7692V3.23081C13.3125 3.17306 13.2884 3.12019 13.2403 3.07219C13.1923 3.02406 13.1394 3 13.0817 3H6.79331C6.73556 3 6.68269 3.02406 6.63469 3.07219C6.58656 3.12019 6.5625 3.17306 6.5625 3.23081V11.7692C6.5625 11.8269 6.58656 11.8798 6.63469 11.9278C6.68269 11.9759 6.73556 12 6.79331 12ZM4.16831 15.75C3.78944 15.75 3.46875 15.6188 3.20625 15.3563C2.94375 15.0938 2.8125 14.7731 2.8125 14.3942V5.29331C2.8125 5.13369 2.86637 5 2.97412 4.89225C3.08175 4.78462 3.21538 4.73081 3.375 4.73081C3.53463 4.73081 3.66831 4.78462 3.77606 4.89225C3.88369 5 3.9375 5.13369 3.9375 5.29331V14.3942C3.9375 14.4519 3.96156 14.5048 4.00969 14.5528C4.05769 14.6009 4.11056 14.625 4.16831 14.625H11.0192C11.1788 14.625 11.3125 14.6788 11.4203 14.7864C11.5279 14.8942 11.5817 15.0279 11.5817 15.1875C11.5817 15.3471 11.5279 15.4808 11.4203 15.5884C11.3125 15.6961 11.1788 15.75 11.0192 15.75H4.16831Z"
                          fill="#919EAB"
                        ></path>
                      </svg>
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
    </ThemeContext.Provider>
    </div>
  );
}
