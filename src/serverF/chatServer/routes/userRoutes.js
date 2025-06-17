// ✅ routes/userRoutes.js - 로그인 + 회원가입 + 토큰 발급 + 세션 저장 + 유효성 검사

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const pool = require("../../DB"); // ✅ getConnection 가능한 mariadb 풀

// ✅ 회원가입 - POST /users
router.post("/", async (req, res) => {
  const { username, name, password, confirmPassword, phone1, phone2, phone3 } = req.body;

  // ✅ 유효성 검사
  if (!username || !name || !password || !confirmPassword || !phone1 || !phone2 || !phone3) {
    return res.status(400).json({ message: "모든 필드를 입력해주세요." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
  }

  try {
    const conn = await pool.getConnection();

    const existing = await conn.query("SELECT * FROM users WHERE username = ?", [username]);
    if (existing.length > 0) {
      conn.release();
      return res.status(409).json({ message: "이미 존재하는 사용자입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await conn.query(
      "INSERT INTO users (username, name, password, phone1, phone2, phone3) VALUES (?, ?, ?, ?, ?, ?)",
      [username, name, hashedPassword, phone1, phone2, phone3]
    );

    conn.release();
    res.status(201).json({ message: "회원가입 성공" });
  } catch (err) {
    console.error("❌ 사용자 등록 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// ✅ 로그인 - POST /users/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "아이디와 비밀번호를 모두 입력해주세요." });
  }

  try {
    const conn = await pool.getConnection();
    const users = await conn.query("SELECT * FROM users WHERE username = ?", [username]);
    conn.release();

    if (users.length === 0) {
      return res.status(401).json({ message: "존재하지 않는 사용자입니다." });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      "your_secret_key",
      { expiresIn: "1h" }
    );

    // ✅ 세션 저장
    req.session.user = {
      id: user.id,
      username: user.username
    };

    res.status(200).json({ message: "로그인 성공", token });
  } catch (err) {
    console.error("❌ 로그인 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

module.exports = router;
