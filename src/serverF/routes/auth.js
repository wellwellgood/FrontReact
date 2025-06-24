// logs.js (ESM 버전)
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const logsDir = path.join(__dirname, "../chatLog/logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function writeChatLog(senderId, receiverId, message) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const logFilePath = path.join(logsDir, `${today}.log`);
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const log = `[${timestamp}] sender_id:${senderId} -> receiver_id:${receiverId} : "${message}"\n`;

  fs.appendFileSync(logFilePath, log);
}

// ✅ 채팅 저장
router.post("/", (req, res) => {
  const { sender_id, receiver_id, content } = req.body;

  if (!sender_id || !receiver_id || !content) {
    return res.status(400).json({ message: "필수 값 누락" });
  }

  writeChatLog(sender_id, receiver_id, content);
  res.status(201).json({ message: "채팅 로그 저장 완료" });
});

// 로그인 라우트 추가
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "아이디 또는 비밀번호 누락" });
  }

  // 여기서는 예시로 간단한 인증 로직
  if (username === "admin" && password === "1234") {
    return res.status(200).json({ message: "로그인 성공", token: "fake-jwt-token" });
  }

  return res.status(401).json({ message: "로그인 실패: 아이디 또는 비밀번호 오류" });
});

export default router;
