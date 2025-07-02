// routes/user.js (ESM 버전)
import express from "express";
import pool from "../DB.mjs";

const router = express.Router();

// 🔹 전체 유저 목록 (exclude 파라미터 지원)
router.get("/", async (req, res) => {
  try {
    const { exclude } = req.query;
    const client = await pool.connect();

    let query = "SELECT id, username, name FROM users";
    let values = [];

    if (exclude) {
      query += " WHERE username != $1";
      values.push(exclude);
    }

    const result = await client.query(query, values);
    client.release();

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("서버 오류");
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

export default router;
