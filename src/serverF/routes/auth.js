import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import  pool  from "../DB.mjs";

const router = express.Router();
const verificationStore = {};
const phoneVerificationStore = new Map();

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

const generateRefreshToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

function generateRandomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ 회원가입
router.post("/register", async (req, res) => {
  const { username, password, name, phone } = req.body;
  if (!username || !password || !name || !phone) {
    return res.status(400).json({ message: "입력 누락" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, password, name, phone) VALUES ($1, $2, $3, $4)",
      [username, hashedPassword, name, phone]
    );
    res.status(201).json({ message: "회원가입 완료" });
  } catch (err) {
    console.error("❌ 회원가입 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// ✅ 인증번호 전송 (mock)
router.post("/send-code", async (req, res) => {
  const { phone } = req.body;
  const code = generateRandomCode();
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3분간 유효

  phoneVerificationStore.set(phone, { code, expiresAt });

  console.log(`📨 인증번호 (${phone}): ${code}`); // 콘솔에 찍힘

  // 테스트용: 인증번호도 프론트에 보내줌
  res.json({
    message: "인증번호가 전송되었습니다.",
    code, // ⚠️ 테스트용. 실서비스에서는 삭제해야 함!
  });
});

router.post("/verify-code", (req, res) => {
  const { phone, code } = req.body;
  const stored = phoneVerificationStore.get(phone);

  if (!stored) {
    return res.status(404).json({ message: "인증 요청 없음" });
  }

  if (stored.code !== code) {
    return res.status(401).json({ message: "코드 불일치" });
  }

  if (stored.expiresAt < new Date()) {
    return res.status(410).json({ message: "인증번호 만료됨" });
  }

  // ✅ 인증 성공 → 메모리 삭제
  phoneVerificationStore.delete(phone);
  return res.json({ message: "인증 성공" });
});

  // 중복 아이디 체크
  router.get("/check-username", async (req, res) => {
    const { username } = req.query;
  
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
  
    if (user.rows.length > 0) {
      return res.json({ available: false });
    }
    return res.json({ available: true });
  });

// ✅ 로그인
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "입력 누락" });

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) return res.status(401).json({ message: "유저 없음" });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "비밀번호 틀림" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "로그인 성공",
      accessToken,
      username: user.username,   // 🔥 추가
      name: user.name            // 🔥 추가
    });
  } catch (err) {
    console.error("❌ 로그인 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// ✅ 아이디 찾기
router.post("/find-id", async (req, res) => {
  const { name, phone1, phone2, phone3 } = req.body;
  const phone = `${phone1}-${phone2}-${phone3}`;

  try {
    const result = await pool.query("SELECT username FROM users WHERE name = $1 AND phone = $2", [name, phone]);
    if (result.rows.length === 0) return res.status(404).json({ message: "일치하는 사용자 없음" });

    return res.status(200).json({ username: result.rows[0].username });
  } catch (err) {
    console.error("❌ 아이디 찾기 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// ✅ 비밀번호 찾기 (임시)
router.post("/find-password", async (req, res) => {
  const { username, name, phone1, phone2, phone3 } = req.body;
  const phone = `${phone1}-${phone2}-${phone3}`;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND name = $2 AND phone = $3",
      [username, name, phone]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "정보 불일치" });

    const token = jwt.sign({ id: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ message: "인증 완료", token });
  } catch (err) {
    console.error("❌ 비밀번호 찾기 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// ✅ 비밀번호 재설정
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "입력 누락" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashed, userId]
    );

    res.status(200).json({ message: "비밀번호가 성공적으로 변경되었습니다." });
  } catch (err) {
    console.error("❌ 비밀번호 재설정 오류:", err);
    res.status(400).json({ message: "유효하지 않은 토큰이거나 만료됨" });
  }
});

// ✅ 토큰 재발급
router.post("/token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "Refresh Token 없음" });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "토큰 유효하지 않음" });
    

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "사용자 없음" });

    const newAccessToken = generateAccessToken(result.rows[0]);
    res.status(200).json({ accessToken: newAccessToken });
  });
});

// ✅ 로그아웃
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "로그아웃 완료" });
});

export default router;
