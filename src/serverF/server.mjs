import dotenv from "dotenv";
dotenv.config();

import http from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./DB.mjs";
import initDB from "./initDB.js";

// 기본 설정만 먼저 테스트
try {
  await connectDB();
} catch (error) {
  console.error("❌ DB 연결 실패:", error);
  process.exit(1);
}

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowOrigin =
  process.env.NODE_ENV === "production"
    ? "https://kkydashboard.netlify.app"
    : "http://localhost:3000";

app.use(
  cors({
    origin: allowOrigin,
    credentials: true,
  })
);

// 🔥 라우트 하나씩 테스트 - 주석을 하나씩 풀어가며 테스트
try {
  console.log("⏸️ 모든 라우트 임시 비활성화 - 기본 서버만 실행");
  
  // const authRoutes = await import("./routes/auth.js");
  // app.use("/api/auth", authRoutes.default);
  // console.log("✅ auth 라우트 로드 성공");
  
  // const userRoutes = await import("./routes/user.js");
  // app.use("/users", userRoutes.default);
  // console.log("✅ user 라우트 로드 성공");
  
  const fileRoutes = await import("./routes/uploadRouter.js");
  app.use("/api/upload", fileRoutes.default);
  console.log("✅ upload 라우트 로드 성공");
  
  const searchRoutes = await import("./routes/searchRoute.js");
  app.use("/api/search", searchRoutes.default);
  console.log("✅ search 라우트 로드 성공");
  
  const healthCheck = await import("./routes/Health.js");
  app.use("/api/health", healthCheck.default);
  console.log("✅ health 라우트 로드 성공");
  
} catch (error) {
  console.error("❌ 라우트 로드 실패:", error);
}

const PORT = process.env.PORT || 10000;
const server = http.createServer(app);

// 🔥 Socket도 임시 비활성화
try {
  // const initializeSocket = await import("./socket.js");
  // initializeSocket.default(server);
  console.log("⏸️ 소켓 임시 비활성화");
} catch (error) {
  console.error("❌ 소켓 초기화 실패:", error);
}

server.listen(PORT, async () => {
  try {
    await initDB();
    console.log(`✅ 기본 서버 실행됨: http://localhost:${PORT}`);
  } catch (err) {
    console.error("❌ 서버 시작 실패:", err.message);
    process.exit(1);
  }
});

console.log("DATABASE_URL:", process.env.NODE_ENV);