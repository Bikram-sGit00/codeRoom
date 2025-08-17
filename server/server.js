// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// CORS: allow your dev frontend
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
}));
app.use(express.json());

// ---- Mongo connect ----
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 15000,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((e) => {
  console.error("❌ Mongo connect error:", e.message);
  process.exit(1);
});

// ---- Models ----
const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true }, // URL-safe id
}, { timestamps: true });

const MessageSchema = new mongoose.Schema({
  roomSlug: { type: String, required: true, index: true },
  user: { type: String, default: "anon" },
  text: { type: String, required: true },
}, { timestamps: true });

const Room = mongoose.model("Room", RoomSchema);
const Message = mongoose.model("Message", MessageSchema);

// simple slugify (no package)
const slugify = (s) =>
  s.toLowerCase().trim()
   .replace(/[^a-z0-9\s-]/g, "")
   .replace(/\s+/g, "-")
   .replace(/-+/g, "-");

// ---- Routes ----
// Create room
app.post("/rooms", async (req, res) => {
  try {
    const name = String(req.body.name || "");
    if (!name.trim()) return res.status(400).json({ error: "Room name required" });

    const slug = slugify(name);
    let room = await Room.findOne({ slug });
    if (!room) room = await Room.create({ name, slug });
    res.json(room);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: "Room already exists" });
    res.status(500).json({ error: "Server error" });
  }
});

// List rooms
app.get("/rooms", async (_req, res) => {
  const rooms = await Room.find().sort({ createdAt: -1 }).lean();
  res.json(rooms);
});

// Get messages in a room
app.get("/rooms/:slug/messages", async (req, res) => {
  const msgs = await Message.find({ roomSlug: req.params.slug }).sort({ createdAt: 1 }).lean();
  res.json(msgs);
});

// Post message to a room
app.post("/rooms/:slug/messages", async (req, res) => {
  const text = String(req.body.text || "");
  const user = String(req.body.user || "anon");
  if (!text.trim()) return res.status(400).json({ error: "Text required" });

  // Ensure room exists
  const room = await Room.findOne({ slug: req.params.slug });
  if (!room) return res.status(404).json({ error: "Room not found" });

  const msg = await Message.create({ roomSlug: req.params.slug, text, user });
  res.json(msg);
});

app.listen(process.env.PORT, () =>
  console.log(`🚀 API on http://localhost:${process.env.PORT}`)
);
