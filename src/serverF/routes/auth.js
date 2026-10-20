import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import  pool  from "../DB.mjs";
import { randomBytes } from "crypto";

const router = express.Router();
const verificationStore = {};
const phoneVerificationStore = new Map();

const databaseErrorCodes = new Set([
  "28P01",
  "3D000",
  "57P01",
  "ECONNREFUSED",
  "ENOTFOUND",
  "ETIMEDOUT",
]);

const authErrorResponse = (res, err) => {
  if (databaseErrorCodes.has(err?.code)) {
    return res.status(503).json({
      message: "데이터베이스에 연결할 수 없습니다. Neon 연결 정보를 확인해 주세요.",
      ...(process.env.NODE_ENV !== "production" && { code: err.code }),
    });
  }

  if (err?.message?.includes("secretOrPrivateKey")) {
    return res.status(503).json({
      message: "로그인 토큰 설정이 누락되었습니다. JWT 환경변수를 확인해 주세요.",
    });
  }

  return res.status(500).json({ message: "로그인 처리 중 서버 오류가 발생했습니다." });
};

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

const naverConfig = () => ({
  clientId: process.env.NAVER_CLIENT_ID,
  clientSecret: process.env.NAVER_CLIENT_SECRET,
  redirectUri: process.env.NAVER_REDIRECT_URI,
});

router.get("/naver/start", (req, res) => {
  const { clientId, clientSecret, redirectUri } = naverConfig();
  if (!clientId || !clientSecret || !redirectUri || !process.env.JWT_SECRET) {
    return res.status(503).json({
      message: "네이버 로그인 환경변수가 설정되지 않았습니다.",
    });
  }

  const state = jwt.sign(
    { provider: "naver", nonce: randomBytes(24).toString("hex") },
    process.env.JWT_SECRET,
    { expiresIn: "10m" },
  );
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
  });

  return res.json({
    state,
    authorizationUrl: `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`,
  });
});

router.post("/naver/callback", async (req, res) => {
  const { code, state } = req.body || {};
  const { clientId, clientSecret, redirectUri } = naverConfig();

  if (!clientId || !clientSecret || !redirectUri || !process.env.JWT_SECRET) {
    return res.status(503).json({
      message: "네이버 로그인 환경변수가 설정되지 않았습니다.",
    });
  }
  if (typeof code !== "string" || !code || typeof state !== "string" || !state) {
    return res.status(400).json({ message: "잘못된 네이버 인증 요청입니다." });
  }

  try {
    const decodedState = jwt.verify(state, process.env.JWT_SECRET);
    if (decodedState.provider !== "naver") {
      return res.status(400).json({ message: "잘못된 네이버 인증 상태입니다." });
    }

    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
      state,
    });
    const tokenResponse = await fetch(
      `https://nid.naver.com/oauth2.0/token?${tokenParams.toString()}`,
      { method: "POST" },
    );
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("❌ 네이버 토큰 교환 실패:", tokenData.error || tokenResponse.status);
      return res.status(502).json({ message: "네이버 인증 토큰을 받지 못했습니다." });
    }

    const profileResponse = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profileData = await profileResponse.json();
    const profile = profileData.response;
    if (!profileResponse.ok || profileData.resultcode !== "00" || !profile?.id) {
      console.error("❌ 네이버 프로필 조회 실패:", profileData.message || profileResponse.status);
      return res.status(502).json({ message: "네이버 사용자 정보를 받지 못했습니다." });
    }

    const client = await pool.connect();
    let user;
    try {
      await client.query("BEGIN");
      const linked = await client.query(
        `SELECT u.* FROM oauth_accounts o
         JOIN users u ON u.id = o.user_id
         WHERE o.provider = $1 AND o.provider_user_id = $2`,
        ["naver", profile.id],
      );

      if (linked.rows[0]) {
        user = linked.rows[0];
      } else {
        const username = `naver_${profile.id}`;
        const name = profile.name || profile.nickname || "네이버 사용자";
        const password = await bcrypt.hash(randomBytes(32).toString("hex"), 10);
        const created = await client.query(
          `INSERT INTO users (username, password, name)
           VALUES ($1, $2, $3)
           ON CONFLICT (username) DO UPDATE SET name = EXCLUDED.name
           RETURNING *`,
          [username, password, name],
        );
        user = created.rows[0];
        await client.query(
          `INSERT INTO oauth_accounts (provider, provider_user_id, user_id)
           VALUES ($1, $2, $3)
           ON CONFLICT (provider, provider_user_id) DO UPDATE SET user_id = EXCLUDED.user_id`,
          ["naver", profile.id, user.id],
        );
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      accessToken,
      username: user.username,
      name: user.name,
    });
  } catch (error) {
    if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
      return res.status(400).json({ message: "네이버 로그인 요청이 만료되었습니다." });
    }
    console.error("❌ 네이버 로그인 오류:", error);
    return authErrorResponse(res, error);
  }
});

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
    if (typeof user.password !== "string" || !user.password) {
      console.error("❌ 로그인 오류: 저장된 비밀번호 형식이 올바르지 않습니다.");
      return res.status(500).json({ message: "계정의 비밀번호 정보를 확인할 수 없습니다." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "비밀번호 틀림" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "로그인 성공",
      accessToken,
      username: user.username,   // 🔥 추가
      name: user.name            // 🔥 추가
    });
  } catch (err) {
    console.error("❌ 로그인 오류:", err.code || err.message);
    return authErrorResponse(res, err);
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
  const values = [username, name, phone1, phone2, phone3];
  if (values.some(value => typeof value !== "string" || !value.trim())) {
    return res.status(400).json({ message: "아이디, 이름, 전화번호를 모두 입력해주세요." });
  }

  try {
    const result = await pool.query(
      `SELECT id FROM public.users
       WHERE username = $1 AND name = $2
         AND phone1 = $3 AND phone2 = $4 AND phone3 = $5`,
      values.map(value => value.trim())
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "정보 불일치" });
    }

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
