// routes/chat.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const logsDir = path.join(__dirname, "../chatLog/logs");

if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

function writeChatLog(senderId, receiverId, message) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const logFilePath = path.join(logsDir, `${today}.log`);
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const log = `[${timestamp}] sender_id:${senderId} -> receiver_id:${receiverId} : "${message}"\n`;

  fs.appendFileSync(logFilePath, log);
}

// 채팅 저장
router.post("/", (req, res) => {
  const { sender_id, receiver_id, content } = req.body;

  if (!sender_id || !receiver_id || !content) {
    return res.status(400).json({ message: "필수 값 누락" });
  }

  writeChatLog(sender_id, receiver_id, content);
  res.status(201).json({ message: "채팅 로그 저장 완료" });
});

// 채팅 로그 조회 (원하면 추가 가능)

module.exports = router;
