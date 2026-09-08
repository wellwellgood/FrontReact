// ✅ 최종 정리된 server.js - Socket.IO만 사용

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./express+mariadb.js");
const http = require("http");
const socket = require("./socket.js");
const userRoutes = require("./routes/userRoutes.js");

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ CORS 설정
app.use(cors({
  origin: "https://myappboard.netlify.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('cors')());

// ✅ API 라우팅
app.get('/api/messages', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT * FROM messages ORDER BY time ASC");
    res.json(rows);
  } catch (err) {
    console.error("📛 메시지 불러오기 오류:", err);
    res.status(500).json({ error: "DB 오류", detail: err.message });
  } finally {
    if (conn) conn.release();
  }
});

app.use("/users", userRoutes);

// ✅ 로그인 API
app.post('/login', async (req, res) => {
  let conn;
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "아이디와 비밀번호를 입력해주세요." });
    }

    conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM users WHERE username = ?", [username]);

    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: "아이디가 존재하지 않습니다." });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      "your_secret_key",
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "로그인 성공", token });
  } catch (err) {
    console.error("❌ 로그인 오류:", err);
    res.status(500).json({ message: "서버 오류 발생", error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// ✅ 상태 확인
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/api/status", (req, res) => {
  res.json({ status: "online", message: "API 서버가 정상적으로 실행 중입니다." });
});

app.get("/api/db-test", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query("SELECT 1 AS test");
    res.json({ status: "success", message: "DB 연결 성공", data: result });
  } catch (err) {
    console.error("❌ DB 연결 실패:", err);
    res.status(500).json({ status: "error", message: "DB 연결 실패", error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// ✅ 프리플라이트 OPTIONS 대응
app.all('/users/login', (req, res, next) => {
  if (req.method === 'OPTIONS') return res.status(200).send();
  next();
});

// ✅ 기타 라우트 처리
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') || req.path === '/') {
    next();
  } else {
    console.log(`📌 404 요청 감지: ${req.path}`);
    res.redirect('/');
  }
});

// ✅ HTTP + Socket.IO 서버 실행
const server = http.createServer(app);
socket(server);

server.listen(PORT, () => {
  console.log(`✅ Server + Socket.IO running on http://localhost:${PORT}`);
});