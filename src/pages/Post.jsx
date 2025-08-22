import { useState } from "react";
import { useParams } from "react-router-dom"; // keep for roomId slugging if you need it later
import "./Post.css";

export default function Post({ onSubmit }) {
  const { roomId } = useParams(); // not used for posting here; parent handles POST

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [lang, setLang] = useState("cpp");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !code.trim() || submitting) return;

    setSubmitting(true);
    try {
      // 👉 hand data to parent; parent will POST, refresh, and close modal
      await onSubmit?.({ name, message, code, lang });

      // clear local fields after successful submit
      setName("");
      setMessage("");
      setCode("");
      setLang("cpp");
    } finally {
      setSubmitting(false);
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

        <button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Posting..." : "Post Code"}
        </button>
      </div>
    </div>
  );
}
