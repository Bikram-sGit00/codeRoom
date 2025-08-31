// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// ---- Middlewares ----
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
// ---- Middlewares ----
// const allowed = [
//   process.env.CLIENT_ORIGIN,     
//   "http://localhost:5173",
//   "http://localhost:3000",
// ].filter(Boolean);

// app.use(
//   cors({
//     origin: allowed,
//     credentials: true,
//   })
// );


// ---- MongoDB connect ----
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ Mongo connect error:", err);
    process.exit(1);
  });

// ---- Models ----
const RoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const MessageSchema = new mongoose.Schema(
  {
    roomSlug: { type: String, required: true, index: true },
    user: { type: String, default: "anon" },
    text: { type: String, default: "" },
    code: { type: String, default: "" },
    lang: { type: String, default: "cpp" },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", RoomSchema);
const Message = mongoose.model("Message", MessageSchema);

// ---- Utils ----
const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// ---- Routes ----

// ✅ Create room
app.post("/api/rooms", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    if (!name) return res.status(400).json({ error: "Room name required" });

    const slug = slugify(name);
    let room = await Room.findOne({ slug });
    if (!room) room = await Room.create({ name, slug });

    res.json(room);
  } catch (err) {
    console.error("❌ Error creating room:", err);
    if (err.code === 11000) {
      return res.status(409).json({ error: "Room already exists" });
    }
    res.status(500).json({ error: "Server error while creating room" });
  }
});

// ✅ List rooms
app.get("/api/rooms", async (_req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 }).lean();
    res.json(rooms);
  } catch (err) {
    console.error("❌ Error fetching rooms:", err);
    res.status(500).json({ error: "Server error while fetching rooms" });
  }
});

// ✅ Get messages in a room
app.get("/api/rooms/:slug/messages", async (req, res) => {
  try {
    const msgs = await Message.find({ roomSlug: req.params.slug })
      .sort({ createdAt: 1 })
      .lean();
    res.json(msgs);
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({ error: "Server error while fetching messages" });
  }
});

// ✅ Post message in a room
app.post("/api/rooms/:slug/messages", async (req, res) => {
  try {
    const { name, message, code, lang } = req.body;

    const room = await Room.findOne({ slug: req.params.slug });
    if (!room) return res.status(404).json({ error: "Room not found" });

    const msg = await Message.create({
      roomSlug: req.params.slug,
      user: name || "anon",       // ✅ map `name` → `user`
      text: message || "",        // ✅ map `message` → `text`
      code: code || "",
      lang: lang || "cpp",
    });

    res.status(201).json(msg);
  } catch (err) {
    console.error("❌ Error saving message:", err);
    res.status(500).json({ error: "Server error while saving message" });
  }
});

// ---- Start ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 API running on http://localhost:${PORT}`)
);


// ---- Root route (just for testing Render) ----
app.get("/", (req, res) => {
  res.send("🚀 CodeRoom API is running!");
});
