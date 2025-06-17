// ✅ server.js
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./express+mariadb.js");
const http = require("http");
const socket = require("./socket.js");
const userRoutes = require("./routes/userRoutes.js");
const messageRoutes = require("./routes/message.js");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: ["https://myappboard.netlify.app", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 라우터 등록
app.use("/api/messages", messageRoutes);
app.use("/users", userRoutes);

app.get("/", (req, res) => res.send("Server is running"));

const server = http.createServer(app);
socket(server);

server.listen(PORT, () => {
  console.log(`✅ Server + Socket.IO running on http://localhost:${PORT}`);
});


// ✅ routes/message.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController.js');

router.post('/', messageController.uploadMiddleware, messageController.saveMessage);
router.get('/', messageController.getMessages);

module.exports = router;


// ✅ controllers/messageController.js
const db = require("../serverF/db.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const cleaned = file.originalname.trim().replace(/\s+/g, "_");
    const uniqueName = Date.now() + "-" + cleaned;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
exports.uploadMiddleware = upload.single("file");

exports.saveMessage = async (req, res) => {
  console.log("📦 req.body:", req.body);
  console.log("📁 req.file:", req.file);

  const { sender_username, receiver_username, receiver_name, content = "[파일]" } = req.body;
  const file = req.file;

  if (!sender_username || !receiver_username || !receiver_name) {
    return res.status(400).json({ message: "필수 정보 누락" });
  }

  try {
    const fileUrl = file ? `/uploads/${file.filename}` : null;
    const fileName = file?.originalname?.trim().replace(/\s+/g, "_") || null;

    await db.query(
      `INSERT INTO messages (sender_username, receiver_username, receiver_name, content, file_url, file_name) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sender_username, receiver_username, receiver_name, content.trim(), fileUrl, fileName]
    );

    res.status(200).json({
      sender_username,
      receiver_username,
      receiver_name,
      content: content.trim(),
      file: file?.filename || null,
      file_name: fileName,
      fileUrl: file ? `${req.protocol}://${req.get("host")}/uploads/${file.filename}` : null,
      time: new Date().toISOString(),
      read: false,
    });
  } catch (err) {
    console.error("❌ 메시지 저장 실패:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM messages ORDER BY time");
    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ 메시지 조회 실패:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};
