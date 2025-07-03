import express from "express";
import pool from "../DB.mjs";
const router = express.Router();

/**
 * @route GET /api/search?query=검색어
 * @desc 사용자 + 파일 전체 검색 (엔터 입력용)
 */
router.get("/", async (req, res) => {
  const { query } = req.query;
  if (!query || query.trim() === "") {
    return res.status(400).json({ error: "검색어가 비어있습니다." });
  }

  const key = `%${query}%`;

  try {
    const [userRes, fileRes] = await Promise.all([
      pool.query(`
        SELECT username, name, profile_image, 'user' AS type
        FROM users
        WHERE username ILIKE $1 OR name ILIKE $1
        LIMIT 20;
      `, [key]),

      pool.query(`
        SELECT file_name, file_size, file_type, uploader, created_at, 'file' AS type
        FROM uploads
        WHERE file_name ILIKE $1 OR description ILIKE $1
        LIMIT 20;
      `, [key])
    ]);

    res.json([...userRes.rows, ...fileRes.rows]);
  } catch (e) {
    console.error("❌ 전체 검색 실패:", e);
    res.status(500).json({ error: "서버 오류" });
  }
});

/**
 * @route GET /api/search/suggest?keyword=입력값
 * @desc 실시간 자동완성 추천 (입력 중 검색어 힌트)
 */
router.get("/suggest", async (req, res) => {
    const { keyword } = req.query;
    if (!keyword || keyword.trim() === "") {
      return res.json([]);
    }
  
    const key = `%${keyword}%`;
  
    try {
      const [userRes, fileRes] = await Promise.all([
        pool.query(`
            SELECT name AS label, 'user' AS type
            FROM users
            WHERE username ILIKE $1 OR name ILIKE $1
            LIMIT 5;
          `, [key]),
    
          pool.query(`
            SELECT file_name AS label, 'file' AS type
            FROM messages
            WHERE file_name ILIKE $1
            LIMIT 5;
          `, [key]),
          
        pool.query(`
            SELECT DISTINCT content AS label, 'text' AS type
            FROM messages
            WHERE content ILIKE $1
            LIMIT 5;`)
      ]);
  
      res.json([...userRes.rows, ...fileRes.rows]);
    } catch (err) {
      console.error("❌ 자동완성 실패:", err);
      res.status(500).json({ error: "서버 오류" });
    }
  });

export default router;
