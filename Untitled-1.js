// =============================
// server.js (Node + Express)
// =============================
// Minimal "Anonymous Code Rooms" app
// - No authentication for posting/reading
// - IP-based rate limiting to reduce spam
// - Rooms defined in config (can be changed without redeploy via ENV)
// - SQLite for persistence
// - Simple admin delete protected by an admin token (optional)
// - Long-polling (poll every few seconds) for simplicity in labs
//
// HOW TO RUN:
//   1) npm init -y && npm i express better-sqlite3 express-rate-limit cors nanoid dotenv
//   2) Save this file as server.js and create /public folder with the HTML files below
//   3) node server.js (or set PORT=8080 ADMIN_TOKEN=yourSecret node server.js)
//   4) Open http://localhost:3000
//
// NOTE: This is intentionally auth-less for students; you (owner) can manage deletes
//       via ADMIN_TOKEN. Use a long random token and keep it private.

import 'dotenv/config';
import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || null; // if null, delete endpoint is disabled

// Rooms can be injected via ENV as comma-separated values, else use defaults
const DEFAULT_ROOMS = ['BCS Section A', 'BCS Section B', 'BCS Section C', 'BCS Section D'];
const ROOMS = (process.env.ROOMS || DEFAULT_ROOMS.join(',')).split(',').map(r => r.trim()).filter(Boolean);

// Initialize DB
const db = new Database('anon-code-rooms.db');
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  caption TEXT,
  language TEXT,
  code TEXT NOT NULL,
  author TEXT,
  created_at INTEGER NOT NULL,
  ip_hash TEXT,
  FOREIGN KEY(room_id) REFERENCES rooms(id)
);

CREATE INDEX IF NOT EXISTS idx_messages_room_created ON messages(room_id, created_at DESC);
`);

// Seed rooms from config if not present
const getRoomByName = db.prepare('SELECT * FROM rooms WHERE name = ?');
const insertRoom = db.prepare('INSERT INTO rooms (id, name, created_at) VALUES (?, ?, ?)');

for (const name of ROOMS) {
  const exists = getRoomByName.get(name);
  if (!exists) {
    insertRoom.run(nanoid(10), name, Date.now());
  }
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Basic rate limit for posting
const postLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 12,             // 12 posts per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper: lightweight IP hash (not cryptographically strong; just to track abuse)
import crypto from 'crypto';
function ipHash(req) {
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || '0.0.0.0';
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

// API: list rooms
app.get('/api/rooms', (req, res) => {
  const rows = db.prepare('SELECT id, name, created_at FROM rooms ORDER BY name ASC').all();
  res.json(rows);
});

// API: get recent messages in a room
// query params: since (ms timestamp) optional, limit (default 100)
app.get('/api/rooms/:roomId/messages', (req, res) => {
  const { roomId } = req.params;
  const since = parseInt(req.query.since ?? '0', 10);
  const limit = Math.min(parseInt(req.query.limit ?? '100', 10), 500);
  const args = [roomId];
  let sql = 'SELECT * FROM messages WHERE room_id = ?';
  if (!isNaN(since) && since > 0) {
    sql += ' AND created_at > ?';
    args.push(since);
  }
  sql += ' ORDER BY created_at DESC LIMIT ?';
  args.push(limit);
  const rows = db.prepare(sql).all(...args);
  res.json(rows);
});

// API: post a message to a room (no auth)
app.post('/api/rooms/:roomId/messages', postLimiter, (req, res) => {
  const { roomId } = req.params;
  const { caption = '', language = '', code = '', author = '' } = req.body ?? {};

  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    return res.status(400).json({ error: 'Code is required.' });
  }
  if (code.length > 20000) {
    return res.status(413).json({ error: 'Code too large (max 20k chars).' });
  }
  const room = db.prepare('SELECT id FROM rooms WHERE id = ?').get(roomId);
  if (!room) return res.status(404).json({ error: 'Room not found.' });

  const msg = {
    id: nanoid(12),
    room_id: roomId,
    caption: caption?.toString().slice(0, 200) ?? '',
    language: language?.toString().slice(0, 30) ?? '',
    code,
    author: author?.toString().slice(0, 40) ?? '',
    created_at: Date.now(),
    ip_hash: ipHash(req),
  };
  db.prepare(`INSERT INTO messages (id, room_id, caption, language, code, author, created_at, ip_hash)
              VALUES (@id, @room_id, @caption, @language, @code, @author, @created_at, @ip_hash)`).run(msg);
  res.json({ ok: true, id: msg.id, created_at: msg.created_at });
});

// API: delete a message (admin only if token is set)
app.delete('/api/messages/:id', (req, res) => {
  if (!ADMIN_TOKEN) return res.status(403).json({ error: 'Delete disabled (no ADMIN_TOKEN set).' });
  const token = req.headers['x-admin-token'] || req.query.token;
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Invalid admin token.' });

  const { id } = req.params;
  const info = db.prepare('DELETE FROM messages WHERE id = ?').run(id);
  res.json({ ok: true, deleted: info.changes });
});

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`\nAnonymous Code Rooms running on http://localhost:${PORT}`));


// =============================
// public/index.html (Room list UI)
// =============================
/* Save as /public/index.html */

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Anonymous Code Rooms</title>
  <!-- Primer CSS (GitHub’s design system) for a GitHub-ish feel -->
  <link rel="stylesheet" href="https://unpkg.com/@primer/css@21.0.7/dist/primer.css" />
  <style>
    body { background: #0d1117; color: #c9d1d9; }
    .box { background: #161b22; border-color: #30363d; }
    a, a:visited { color: #58a6ff; }
  </style>
</head>
<body class="p-4">
  <div class="container-lg">
    <h1 class="f2-light mb-3">Anonymous Code Rooms</h1>
    <p class="color-fg-subtle">Zero-login snippet board for classroom/lab use. Pick a room to read/post code.</p>

    <div id="rooms" class="Box p-3 box"></div>
  </div>

  <script>
    async function loadRooms() {
      const res = await fetch('/api/rooms');
      const rooms = await res.json();
      const wrap = document.getElementById('rooms');
      if (!rooms.length) {
        wrap.innerHTML = '<p>No rooms configured. Ask the admin.</p>';
        return;
      }
      wrap.innerHTML = rooms.map(r => `
        <div class="Box-row d-flex flex-items-center flex-justify-between">
          <div>
            <div class="f4">${r.name}</div>
            <div class="color-fg-subtle f6">Created: ${new Date(r.created_at).toLocaleString()}</div>
          </div>
          <a class="btn btn-primary btn-sm" href="/room.html?id=${r.id}&name=${encodeURIComponent(r.name)}">Enter</a>
        </div>
      `).join('');
    }
    loadRooms();
  </script>
</body>
</html>


// =============================
// public/room.html (Room timeline + post form)
// =============================
/* Save as /public/room.html */

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Room – Anonymous Code Rooms</title>
  <link rel="stylesheet" href="https://unpkg.com/@primer/css@21.0.7/dist/primer.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
  <style>
    body { background: #0d1117; color: #c9d1d9; }
    .box { background: #161b22; border-color: #30363d; }
    pre { position: relative; }
    .copy-btn { position: absolute; top: 8px; right: 8px; }
    .meta { border-bottom: 1px solid #30363d; padding-bottom: 4px; margin-bottom: 8px; }
    .muted { color: #8b949e; }
    .code-card { margin-bottom: 16px; }
  </style>
</head>
<body class="p-4">
  <div class="container-lg">
    <a href="/" class="btn btn-sm mb-3">← Back to rooms</a>
    <h1 id="roomTitle" class="f2-light mb-2"></h1>
    <p class="color-fg-subtle">Post code snippets with a caption. No login required. Please be respectful.</p>

    <div class="Box box mb-3 p-3">
      <form id="postForm" class="d-flex flex-column gap-2">
        <div class="d-flex gap-2">
          <input class="form-control input-sm" name="caption" placeholder="Caption (e.g., Two Sum in C++)" maxlength="200" />
          <input class="form-control input-sm" name="author" placeholder="Name (optional)" maxlength="40" />
          <input class="form-control input-sm" name="language" placeholder="Language (e.g., cpp, js, py)" maxlength="30" />
        </div>
        <textarea class="form-control" name="code" rows="8" placeholder="Paste code here..." required></textarea>
        <button class="btn btn-primary" type="submit">Post snippet</button>
        <div id="postMsg" class="mt-2"></div>
      </form>
    </div>

    <div id="feed"></div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script>
    const params = new URLSearchParams(location.search);
    const roomId = params.get('id');
    const roomName = params.get('name') || 'Room';
    document.getElementById('roomTitle').textContent = roomName;

    const feed = document.getElementById('feed');
    const postForm = document.getElementById('postForm');
    const postMsg = document.getElementById('postMsg');

    function el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }

    async function loadMessages() {
      const res = await fetch(`/api/rooms/${roomId}/messages?limit=200`);
      const items = await res.json();
      feed.innerHTML = '';
      if (!items.length) {
        feed.append(el('<p class="muted">No posts yet. Be the first!</p>'));
        return;
      }
      for (const m of items) {
        const when = new Date(m.created_at).toLocaleString();
        const cap = m.caption ? `<div class="f4">${escapeHtml(m.caption)}</div>` : '';
        const who = m.author ? `<span>• ${escapeHtml(m.author)}</span>` : '';
        const lang = m.language ? `language-${escapeHtml(m.language)}` : '';
        const card = el(`
          <div class="Box box code-card">
            <div class="Box-header meta d-flex flex-justify-between flex-items-center">
              <div>
                ${cap}
                <div class="muted f6">${when} ${who}</div>
              </div>
              <button class="btn btn-sm" data-action="copy" data-id="${m.id}">Copy</button>
            </div>
            <div class="Box-body">
              <pre><code class="hljs ${lang}" id="code-${m.id}"></code></pre>
            </div>
          </div>
        `);
        feed.append(card);
        const codeEl = card.querySelector(`#code-${m.id}`);
        codeEl.textContent = m.code; // keep raw text to avoid XSS
        hljs.highlightElement(codeEl);
      }
    }

    function escapeHtml(str) {
      return str.replace(/[&<>\"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\'':'&#39;'}[s]));
    }

    // Copy handler (event delegation)
    feed.addEventListener('click', async (e) => {
      const btn = e.target.closest('button[data-action="copy"]');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      const codeEl = document.getElementById(`code-${id}`);
      if (!codeEl) return;
      try {
        await navigator.clipboard.writeText(codeEl.textContent);
        btn.textContent = 'Copied!';
        setTimeout(() => (btn.textContent = 'Copy'), 1200);
      } catch (err) {
        alert('Copy failed');
      }
    });

    // Post form
    postForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(postForm);
      const payload = {
        caption: fd.get('caption') || '',
        author: fd.get('author') || '',
        language: (fd.get('language') || '').toLowerCase().trim(),
        code: fd.get('code') || ''
      };
      postMsg.textContent = 'Posting...';
      const res = await fetch(`/api/rooms/${roomId}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        postMsg.innerHTML = `<span class="color-fg-danger">${data.error || 'Failed to post'}</span>`;
        return;
      }
      postMsg.innerHTML = '<span class="color-fg-success">Posted!</span>';
      postForm.reset();
      await loadMessages();
      setTimeout(() => (postMsg.textContent = ''), 1500);
    });

    // Poll every 5 seconds for new messages
    loadMessages();
    setInterval(loadMessages, 5000);
  </script>
</body>
</html>


// =============================
// OPTIONAL: Quick admin delete helper (bookmarklet or tiny page)
// =============================
// You can delete a message by ID using: 
//   fetch('/api/messages/<ID>', { method: 'DELETE', headers: { 'x-admin-token': '<ADMIN_TOKEN>' }})
// Create your own small admin page if needed.
