// server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const corsMiddleware = require("./middlewares/cors.js");

const authRoutes = require("./routes/auth.js");
const messageRoutes = require("./routes/message.js");
const uploadRoutes = require("./routes/uploadRouter.js");
const chatRoutes = require("./chatLog/logs.js");
const socket = require("./socket.js");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// ✅ 미들웨어
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ API 라우트
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);

// ✅ 서버 상태 확인용
app.get("/", (req, res) => {
  res.send("서버 정상 작동 중입니다.");
});

// ✅ 소켓 서버 연결
socket(server);

// ✅ 서버 시작
server.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
