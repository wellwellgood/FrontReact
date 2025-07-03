import express from "express";
import { pool } from "../DB.mjs";

const router = express.Router();

// 🔍 자동완성 API
router.get("/suggest", async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) return res.json([]);

    const key = `%${keyword}%`;

    try {
    const [userRes, fileRes, contentRes] = await Promise.all([
        pool.query(`SELECT username, name FROM users WHERE username ILIKE $1 OR name ILIKE $1 LIMIT 5`, [key]),
        pool.query(`SELECT file_name FROM messages WHERE file_name ILIKE $1 LIMIT 5`, [key]),
        pool.query(`SELECT content FROM messages WHERE content ILIKE $1 LIMIT 5`, [key]),
    ]);

    const suggestions = [
        ...userRes.rows.map(u => ({ type: "user", label: u.name || u.username })),
        ...fileRes.rows.map(f => ({ type: "file", label: f.file_name })),
        ...contentRes.rows.map(c => ({ type: "content", label: c.content })),
    ];

        res.json(suggestions);
    } catch (err) {
        console.error("❌ 자동완성 실패:", err);
        res.status(500).json([]);
    }
});

// 🔎 전체 검색 API
router.get("/", async (req, res) => {
    const { query } = req.query;
    if (!query) return res.json([]);
  
    const key = `%${query}%`;
  
    try {
      const [userRes, fileRes, contentRes] = await Promise.all([
        pool.query(`SELECT 'user' AS type, id, username, name FROM users WHERE username ILIKE $1 OR name ILIKE $1`, [key]),
        pool.query(`SELECT 'file' AS type, id, file_name FROM messages WHERE file_name ILIKE $1`, [key]),
        pool.query(`SELECT 'content' AS type, id, content FROM messages WHERE content ILIKE $1`, [key]),
      ]);
  
      const allResults = [...userRes.rows, ...fileRes.rows, ...contentRes.rows];
      console.log("🔎 검색 결과:", allResults); // ✅ 이건 있어도 OK
      res.json(allResults); // 🔥 이걸로만 응답해야 함
    } catch (err) {
      console.error("❌ 검색 실패:", err);
      res.status(500).json([]);
    }
  });

export default router;
