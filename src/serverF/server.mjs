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
import messageRoutes from "./routes/message.js";
import fileRoutes from "./routes/uploadRouter.js";
import initDB from "./initDB.js";
import { connectDB } from "./DB.mjs";
import healthCheck from "./routes/Health.js";
await connectDB();

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

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", fileRoutes);
app.use("/users", userRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/health", healthCheck);

const PORT = process.env.PORT || 10000;
const server = http.createServer(app);
initializeSocket(server);

server.listen(PORT, async () => {
  try {
    await initDB();
    console.log("Running Time:", koreaTime);
    console.log(`✅ 서버 실행됨: http://localhost:${PORT}`);
  } catch (err) {
    console.error(err.message);
    console.error("❌ 서버 시작 실패:", err.message);
  }
});

app.use('/api', (req, res, next) => {
  res.header('Access-Control-Max-Age', '86400');
  res.header('Vary', 'Origin');
  next();
});

app.options('/*', (req, res) => {
  res.sendStatus(200);
});

console.log("DATABASE_URL:", process.env.NODE_ENV);