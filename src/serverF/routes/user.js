// routes/user.js
const express = require("express");
const router = express.Router();
const pool = require("../DB"); // PostgreSQL 연결 풀

// 🔹 전체 유저 목록 조회 (내 아이디 제외)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT username, name, profile_image FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ 전체 유저 조회 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

// 🔹 특정 유저 조회
router.get("/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "유저를 찾을 수 없습니다." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ 유저 조회 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

module.exports = router;
