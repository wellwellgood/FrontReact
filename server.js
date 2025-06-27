import express from "express";
import dotenv from "dotenv";
import http from "http";
import corsMiddleware from "./src/serverF/middlewares/cors.js";
import authRoutes from "./src/serverF/routes/auth.js";
import messageRoutes from "./src/serverF/routes/message.js";
import initializeSocket from "./src/serverF/socket.js";
import db from "./src/serverF/DB.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// 🔐 DB 연결
await db.connectDB();

// ✅ 미들웨어
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ API 라우터
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ✅ 정적 파일 제공 (예: Firebase 등에서 받은 파일)
app.use("/uploads", express.static("uploads"));

// ✅ 소켓 연결
initializeSocket(server);

// ✅ 서버 실행
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});