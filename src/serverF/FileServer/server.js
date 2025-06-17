const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL 연결
const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

// CORS 설정
const allowList = ["https://myappboard.netlify.app"];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// 파일 업로드 설정
const uploadDir = path.join(__dirname, "upload");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

/* ✅ 로그인 */
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "아이디 또는 비밀번호 누락됨" });

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );

    if (result.rows.length > 0) {
      res.status(200).json({ token: "로그인성공토큰" });
    } else {
      res.status(401).json({ message: "아이디 또는 비밀번호 오류" });
    }
  } catch (err) {
    console.error("❌ 로그인 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

/* ✅ 회원가입 */
app.post("/api/register", async (req, res) => {
  const { username, password, name } = req.body;
  if (!username || !password || !name)
    return res.status(400).json({ message: "모든 항목 입력 필요" });

  try {
    const check = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (check.rows.length > 0)
      return res.status(409).json({ message: "이미 존재하는 아이디입니다." });

    await pool.query(
      "INSERT INTO users (username, password, name) VALUES ($1, $2, $3)",
      [username, password, name]
    );

    res.status(201).json({ message: "회원가입 성공" });
  } catch (err) {
    console.error("❌ 회원가입 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

/* ✅ 파일 업로드 */
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, message: "파일 누락" });
  res.status(200).json({ success: true, filename: req.file.originalname });
});

/* ✅ 파일 목록 조회 */
app.get("/files", (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    res.status(200).json({ success: true, files });
  } catch (err) {
    console.error("❌ 파일 목록 오류:", err);
    res.status(500).json({ success: false, message: "파일 목록 오류" });
  }
});

/* ✅ 파일 다운로드 */
app.get("/download/:filename", (req, res) => {
  const filepath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filepath)) {
    res.download(filepath);
  } else {
    res.status(404).json({ success: false, message: "파일 없음" });
  }
});

/* ✅ 메시지 저장 */
app.post("/api/messages", async (req, res) => {
  const { sender_username, receiver_username, content, time } = req.body;

  if (!sender_username || !receiver_username || !content || !time)
    return res.status(400).json({ message: "모든 필드가 필요합니다." });

  try {
    await pool.query(
      "INSERT INTO messages (sender_username, receiver_username, content, time) VALUES ($1, $2, $3, $4)",
      [sender_username, receiver_username, content, time]
    );
    res.status(201).json({ message: "메시지 저장 완료" });
  } catch (err) {
    console.error("❌ 메시지 저장 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

/* ✅ 메시지 조회 (옵션: 전체 or 특정 유저끼리) */
app.get("/api/messages", async (req, res) => {
  const { sender, receiver } = req.query;

  let query = "SELECT * FROM messages";
  const values = [];

  if (sender && receiver) {
    query += " WHERE sender_username = $1 AND receiver_username = $2";
    values.push(sender, receiver);
  }

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ 메시지 조회 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

/* ✅ 서버 상태 확인 */
app.get("/test", (req, res) => {
  res.json({ message: "✅ 서버 작동 중" });
});

/* ✅ 서버 시작 */
app.listen(PORT, () => {
  console.log(`✅ 서버가 포트 ${PORT}에서 실행 중`);
});
