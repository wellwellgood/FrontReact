import dotenv from "dotenv";
dotenv.config();

import http from "http";
import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import { connectDB } from "./DB.mjs";
import initDB from "./initDB.js";
import corsMiddleware from "./middlewares/cors.js";
import authRouter from "./routes/auth.js";
import chatUploadRouter from './routes/upload.js';

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

  console.log("✅ authRouter 타입:", typeof authRouter);
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

  app.use('/api/upload-chat', chatUploadRouter);
  app.use('/api/download', chatUploadRouter);
  app.use("/api/users", userRoutes.default)

  // ✅ 여기 수정: .default 붙여서 라우터 등록
  const chatUploadRouterModule = await import("./routes/neonPostgre.js");

  if (chatUploadRouterModule.default) {
    console.log("✅ chatUploadRouter 타입:", typeof chatUploadRouterModule.default);
    app.use("/api/chat-upload", chatUploadRouterModule.default);
  } else {
    console.error("❌ chatUploadRouter 불러오기 실패:", chatUploadRouterModule);
  }

  // ✅ 정적 파일 경로
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

} catch (error) {
  console.error("❌ 라우트 로드 실패:", error);
}

const PORT = process.env.PORT || 10000;
const server = http.createServer(app);

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
