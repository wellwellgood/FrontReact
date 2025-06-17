// server.js – 통합 버전
// ───────────────────────────────────────────────────────────
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const path = require("path");

// DB (PostgreSQL / Neon)
const db = require("./controllers/db.js");

// 메시지 전용 라우터 + 컨트롤러
const messageRoutes = require("./controllers/messageController.js");
// Socket.IO 설정 (채팅 실시간 전송용)
const socket = require("./socket.js");

const app = express();
const PORT = process.env.PORT || 4000;

// ──────────────── 미들웨어 ────────────────
app.use(cors({
  origin: ["https://myappboard.netlify.app", "http://localhost:3000"],
  credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 정적 파일 (첨부파일)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ──────────────── API 라우트 ────────────────
// 1) 사용자 목록 (본인 제외)
app.get("/users", async (req, res) => {
  const exclude = req.query.exclude || "";
  try {
    const result = await db.query(
      "SELECT username, name FROM users WHERE username != $1 ORDER BY name",
      [exclude]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ 유저 목록 조회 실패:", err.message);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// 2) 메시지 라우터 (파일 첨부 포함)
app.use("/api/messages", messageRoutes);

// 헬스체크
app.get("/", (req, res) => res.send("🚀 Server is running"));

// ──────────────── 서버 + 소켓 ────────────────
const server = http.createServer(app);
socket(server); // Socket.IO 초기화 (socket.js 내부 구현)

server.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});
