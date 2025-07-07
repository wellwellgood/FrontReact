import dotenv from "dotenv";
dotenv.config();

// console.log("✅ DB_PASSWORD:", process.env.DB_PASSWORD);

import http from "http";
import initializeSocket from "./socket.js"
import searchRoutes from "./routes/searchRoute.js";
// import corsMiddleware from "./middlewares/cors.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js"
import messageRoutes from "./routes/message.js";
import fileRoutes from "./routes/uploadRouter.js";
import initDB from "./initDB.js"; // DB 연결 함수
import { connectDB } from "./DB.mjs";
await connectDB();

const app = express();

// 미들웨어
app.use(express.json());
app.use(cookieParser());

const allowOrigin = 
process.env.NODE_ENV === "production"
? "https://kkydashboard.netlify.app" 
: "http://localhost:10000"

// CORS 설정 (withCredentials 허용)
app.use(cors({
  origin: allowOrigin, // 배포 시 수정 필요
  credentials: true
}));

const koreaTime = new Date().toLocaleString("ko-KR", {
  timeZone: "Asia/Seoul",
});

// 라우터 등록
app.use("/api/auth", authRoutes);
app.use("/api", messageRoutes);
app.use("/api/upload", fileRoutes);
app.use("/users", userRoutes);
app.use("/api/search", searchRoutes);

// 서버 실행
const PORT = process.env.PORT || 10000;
const server = http.createServer(app); // express 앱을 기반으로 HTTP 서버 생성
initializeSocket(server);              // 소켓 서버 붙이기

server.listen(PORT, async () => {

  try {
    await initDB();
    console.log("Running Time:", koreaTime);
    console.log(`✅ 서버 실행됨: http://localhost:${PORT}`);
  } catch (err) {
    console.error( err.message);
    console.error("❌ 서버 시작 실패:", err.message);
  }
});

app.use((req, res, next) => {
  console.log("🔥 요청 도착:", req.method, req.url);
  next();
});

console.log("DATABASE_URL:", process.env.NODE_ENV);