// chatLog/logs.js
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const router = express.Router();
const logsDir = path.join(__dirname, "./logs");   // ./chatLog/logs 폴더

// 폴더 없으면 생성
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// 로그 쓰기 함수
function writeChatLog(senderId, receiverId, message) {
  const today   = new Date().toISOString().split("T")[0];             // YYYY-MM-DD
  const logFile = path.join(logsDir, `${today}.log`);
  const timeStr = new Date().toISOString().replace("T", " ").slice(0, 19);
  const line    = `[${timeStr}] sender_id:${senderId} -> receiver_id:${receiverId} : "${message}"\n`;
  fs.appendFileSync(logFile, line);
}

// ✅ 채팅 저장
router.post("/", (req, res) => {
  const { sender_id, receiver_id, content } = req.body;
  if (!sender_id || !receiver_id || !content)
    return res.status(400).json({ message: "필수 값 누락" });

  writeChatLog(sender_id, receiver_id, content);
  res.status(201).json({ message: "채팅 로그 저장 완료" });
});

export default router;   // ⭐️ default export
