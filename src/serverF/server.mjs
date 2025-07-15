import dotenv from "dotenv";
dotenv.config();

import http from "http";
import initializeSocket from "./socket.js";
import searchRoutes from "./routes/searchRoute.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
// import messageRoutes from "./routes/message.js"; // 임시 주석 처리
import fileRoutes from "./routes/uploadRouter.js";
import initDB from "./initDB.js";
import { connectDB } from "./DB.mjs";
import healthCheck from "./routes/Health.js";

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

const koreaTime = new Date().toLocaleString("ko-KR", {
  timeZone: "Asia/Seoul",
});

// 라우트를 하나씩 추가하면서 테스트
try {
  app.use("/api/auth", authRoutes);
  console.log("✅ auth 라우트 로드 성공");
} catch (error) {
  console.error("❌ auth 라우트 로드 실패:", error);
}

try {
  // app.use("/api/messages", messageRoutes); // 임시 주석 처리
  console.log("⏸️ message 라우트 임시 비활성화");
} catch (error) {
  console.error("❌ message 라우트 로드 실패:", error);
}

try {
  app.use("/api/upload", fileRoutes);
  console.log("✅ upload 라우트 로드 성공");
} catch (error) {
  console.error("❌ upload 라우트 로드 실패:", error);
}

try {
  app.use("/users", userRoutes);
  console.log("✅ user 라우트 로드 성공");
} catch (error) {
  console.error("❌ user 라우트 로드 실패:", error);
}

try {
  app.use("/api/search", searchRoutes);
  console.log("✅ search 라우트 로드 성공");
} catch (error) {
  console.error("❌ search 라우트 로드 실패:", error);
}

try {
  app.use("/api/health", healthCheck);
  console.log("✅ health 라우트 로드 성공");
} catch (error) {
  console.error("❌ health 라우트 로드 실패:", error);
}

const PORT = process.env.PORT || 10000;
const server = http.createServer(app);

try {
  initializeSocket(server);
  console.log("✅ 소켓 초기화 성공");
} catch (error) {
  console.error("❌ 소켓 초기화 실패:", error);
}

server.listen(PORT, async () => {
  try {
    await initDB();
    console.log("Running Time:", koreaTime);
    console.log(`✅ 서버 실행됨: http://localhost:${PORT}`);
  } catch (err) {
    console.error("❌ 서버 시작 실패:", err.message);
    process.exit(1);
  }
});

app.use("/*", (req, res, next) => {
  res.header("Access-Control-Max-Age", "86400");
  res.header("Vary", "Origin");
  next();
});

app.options("/*", (req, res) => {
  res.sendStatus(200);
});

console.log("DATABASE_URL:", process.env.NODE_ENV);