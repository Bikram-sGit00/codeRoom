import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ navigate back
import "./Post.css";

export default function Post() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [lang, setLang] = useState("cpp");

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // normalize to slug format
  const roomSlug = roomId
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");

  const handleSubmit = async () => {
    if (!name.trim() || !code.trim()) {
      alert("Please enter your name and some code before posting.");
      return;
    }

    const postData = { name, message, code, lang };

    try {
      const res = await fetch(`${API_BASE}/api/rooms/${roomSlug}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (!res.ok) throw new Error("Failed to save post");

      alert("✅ Code posted successfully!");

      // clear inputs
      setName("");
      setMessage("");
      setCode("");
      setLang("cpp");

      // ✅ redirect back to room page (singular /room/)
      navigate(`/room/${roomSlug}`);
    } catch (err) {
      console.error("Error posting:", err);
      alert("❌ Something went wrong while saving.");
    }
  };

  return (
    <div className="post-page">
      <div className="post-card">
        <h1>Contribute in your classroom🚀✨</h1>

        <input
          type="text"
          placeholder="What's your name buddy🙋🏻‍♂️?"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Any message🧑🏻‍💻?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* Code + Language selector */}
        <div className="code-label-row">
          <label className="code-label">Code</label>
          <div className="lang-select-wrap">
            <label htmlFor="lang" className="lang-label">
              Language
            </label>
            <select
              id="lang"
              className="lang-select"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="jsx">React (JSX)</option>
              <option value="tsx">React (TSX)</option>
              <option value="go">Go</option>
              <option value="php">PHP</option>
              <option value="swift">Swift</option>
              <option value="rust">Rust</option>
              <option value="sql">SQL</option>
              <option value="bash">Bash</option>
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
            </select>
          </div>
        </div>

        <textarea
          placeholder="Paste your code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
        />

        <button onClick={handleSubmit}>Post Code</button>
      </div>
    </div>
  );
}
