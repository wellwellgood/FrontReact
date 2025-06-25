// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import path from "path";
import corsMiddleware from "./middlewares/cors.js";
import initDB from "./initDB.js";
import { testConnection } from "./DB.js";
import db from "./chatServer/controllers/db.js";

import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/message.js";
import chatRoutes from "./chatLog/logs.js";
import initializeSocket from "./socket.js";
import userRoutes from "./routes/user.js";
import uploadRoutes from "./routes/uploadRouter.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 10000;

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/users", userRoutes);

let dbConnected = false;
app.use(async (req, res, next) => {
  if (!dbConnected && (
    req.path.startsWith('/api/auth') ||
    req.path.startsWith('/api/messages') ||
    req.path.startsWith('/api/chat')
  )) {
    return res.status(503).json({
      status: 'error',
      message: '데이터베이스 연결이 현재 불가능합니다. 잠시 후 다시 시도해주세요.'
    });
  }
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "online",
    dbStatus: dbConnected ? "connected" : "disconnected",
    message: "서버 정상 작동 중입니다."
  });
});

app.get("/api/status/db", async (req, res) => {
  const isConnected = await testConnection();
  dbConnected = isConnected;
  
  res.json({
    dbStatus: isConnected ? "connected" : "disconnected",
    lastChecked: new Date().toISOString()
  });
});

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

// ✅ 소켓 연결
initializeSocket(server);

socket.on("sendMessage", (msg) => {
  io.to(msg.receiver_username).emit("message", msg);
});

// ✅ 서버 시작
const startServer = async () => {
  server.listen(PORT, () => {
    console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);

    testConnection().then(connected => {
      dbConnected = connected;
      if (connected) {
        console.log('✅ DB 연결 확인 완료');
        return initDB();
      } else {
        console.log('⚠️ DB 연결 실패 (서버는 계속 실행됨)');
        setInterval(async () => {
          const result = await testConnection();
          if (result && !dbConnected) {
            dbConnected = true;
            console.log('✅ DB 연결 복구됨');
            initDB();
          } else if (!result && dbConnected) {
            dbConnected = false;
            console.log('❌ DB 연결이 끊어짐');
          }
        }, 10 * 60 * 1000);
      }
    });
  });
};

startServer();
