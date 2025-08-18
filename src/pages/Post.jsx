import { useState } from "react";
import "./Post.css";

export default function Post({ onSubmit }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [lang, setLang] = useState("cpp"); // NEW

  const handleSubmit = () => {
    if (!name.trim() || !code.trim()) {
      alert("Please enter your name and some code before posting.");
      return;
    }
    if (onSubmit) {
      onSubmit({ name, message, code, lang }); // include lang
    }
    setName("");
    setMessage("");
    setCode("");
    setLang("cpp");
  };

  return (
    <div className="post-page">
      <div className="post-card">
        <h1>Contribute in your classroom🚀✨</h1>

        <input
          type="text"
          placeholder="What's your name buddy?"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Any message?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* Label + Language select row */}
        <div className="code-label-row">
          <label className="code-label">Code</label>

          <div className="lang-select-wrap">
            <label htmlFor="lang" className="lang-label">Language</label>
            <select
              id="lang"
              className="lang-select"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              {/* values match Prism class names: language-<value> */}
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="csharp">C#</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="jsx">React (JSX)</option>
              <option value="tsx">React (TSX)</option>
              <option value="go">Go</option>
              <option value="ruby">Ruby</option>
              <option value="php">PHP</option>
              <option value="swift">Swift</option>
              <option value="kotlin">Kotlin</option>
              <option value="rust">Rust</option>
              <option value="scala">Scala</option>
              <option value="sql">SQL</option>
              <option value="bash">Bash</option>
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
              <option value="markdown">Markdown</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="dart">Dart</option>
              <option value="r">R</option>
              <option value="lua">Lua</option>
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
