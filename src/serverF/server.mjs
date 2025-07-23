import dotenv from "dotenv";
dotenv.config();

import http from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./DB.mjs";
import initDB from "./initDB.js";
import messageRoute from "./routes/message.js";
import corsMiddleware from "./middlewares/cors.js"

// 기본 설정만 먼저 테스트
try {
  await connectDB();
} catch (error) {
  console.error("❌ DB 연결 실패:", error);
  process.exit(1);
}

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());


try {
  console.log("⏸️ 모든 라우트 임시 비활성화 - 기본 서버만 실행");
  
  const authRouter = await import("./routes/auth.js");
  app.use("/api/auth", authRouter);
  
  const userRoutes = await import("./routes/user.js");
  app.use("/users", userRoutes.default);
  
  const fileRoutes = await import("./routes/uploadRouter.js");
  app.use("/api/upload", fileRoutes.default);
  
  const searchRoutes = await import("./routes/searchRoute.js");
  app.use("/api/search", searchRoutes.default);
  
  const healthCheck = await import("./routes/Health.js");
  app.use("/api/health", healthCheck.default);

  const messageRoute = await import("./routes/message.js");
  app.use("/api/messages", messageRoute.default);
  
} catch (error) {
  console.error("❌ 라우트 로드 실패:", error);
}

const PORT = process.env.PORT || 10000;
const server = http.createServer(app);

// 🔥 Socket도 임시 비활성화
try {
  const initializeSocket = await import("./socket.js");
  initializeSocket.default(server);
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