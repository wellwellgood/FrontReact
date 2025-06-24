import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import db from "../chatServer/controllers/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const logsDir = path.join(__dirname, "../chatLog/logs");

// 로그 디렉토리 없으면 생성
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ✅ 채팅 로그 저장 함수
function writeChatLog(senderId, receiverId, message) {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const logFilePath = path.join(logsDir, `${today}.log`);
  const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
  const log = `[${timestamp}] sender_id:${senderId} -> receiver_id:${receiverId} : "${message}"\n`;

  fs.appendFileSync(logFilePath, log);
}

// ✅ 채팅 저장 API
router.post("/", (req, res) => {
  const { sender_id, receiver_id, content } = req.body;

  if (!sender_id || !receiver_id || !content) {
    return res.status(400).json({ message: "필수 값 누락" });
  }

  writeChatLog(sender_id, receiver_id, content);
  res.status(201).json({ message: "채팅 로그 저장 완료" });
});

// ✅ 로그인 API (bcrypt + DB)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "아이디 또는 비밀번호 누락" });
  }

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "존재하지 않는 사용자입니다." });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "비밀번호가 틀렸습니다." });
    }

    res.status(200).json({
      message: "로그인 성공",
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("❌ 로그인 오류:", err.message);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

export default router;
