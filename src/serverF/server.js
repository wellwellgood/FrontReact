import dotenv from "dotenv";
dotenv.config();

console.log("✅ DB_PASSWORD:", process.env.DB_PASSWORD);

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/message.js";
import fileRoutes from "./routes/uploadRouter.js";
import initDB from "./initDB.js"; // DB 연결 함수
import { connectDB } from "./DB.js";
await connectDB();

const app = express();

// 미들웨어
app.use(express.json());
app.use(cookieParser());

// CORS 설정 (withCredentials 허용)
app.use(cors({
  origin: "http://localhost:3000", // 배포 시 수정 필요
  credentials: true
}));

// 라우터 등록
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", fileRoutes);

// 서버 실행
const PORT = 10000;
app.listen(PORT, async () => {
  console.log("🔥 서버 실행 준비 중...");
  console.log(`✅ 서버가 http://localhost:${PORT} 에서 실행 중`);

  try {
    await initDB();
    console.log(`✅ DB 연결 확인 완료: ${new Date().toISOString()}`);
  } catch (err) {
    console.error("⚠️ DB 연결 실패 (서버는 계속 실행됨)", err.message);
  }
});
