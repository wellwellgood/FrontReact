import express from "express";
import pool from "../DB.mjs";
const router = express.Router();

router.get("/suggest", async (req, res) => {
  const { keyword } = req.query;

  if (!keyword || keyword.trim() === "") {
    return res.json([]);
  }

  const key = `%${keyword}%`;

  try {
    const [userRes, fileRes, contentRes] = await Promise.all([
      // 사용자 이름 + ID 검색
      pool.query(`
        SELECT name AS label, 'user' AS type
        FROM users
        WHERE username ILIKE $1 OR name ILIKE $1
        LIMIT 5;
      `, [key]),

      // 파일명 검색 (메시지에 첨부된 파일)
      pool.query(`
        SELECT file_name AS label, 'file' AS type
        FROM messages
        WHERE file_name IS NOT NULL AND file_name ILIKE $1
        LIMIT 5;
      `, [key]),

      // 메시지 내용 검색 (선택사항)
      pool.query(`
        SELECT DISTINCT content AS label, 'content' AS type
        FROM messages
        WHERE content IS NOT NULL AND content ILIKE $1
        LIMIT 5;
      `, [key])
    ]);

    const results = [
      ...userRes.rows,
      ...fileRes.rows,
      ...contentRes.rows
    ].filter(item => item.label); // null 제거

    console.log("🔍 자동완성 결과:", results);
    res.json(results);
  } catch (err) {
    console.error("❌ 자동완성 에러:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

export default router;
