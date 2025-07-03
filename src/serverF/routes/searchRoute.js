import express from "express";
import pool from "../DB.mjs";
const router = express.Router();

/**
 * @route GET /api/suggest?keyword=입력값
 * @desc 사용자 및 파일명에서 유사 키워드 추천
 */
router.get("/", async (req, res) => {
    const { keyword } = req.query;
    if (!keyword || keyword.trim() === "") {
      return res.json([]);
    }
  
    const key = `%${keyword}%`;
  
    const userSql = `
      SELECT name AS label, 'user' AS type
      FROM users
      WHERE username ILIKE $1 OR name ILIKE $1
      LIMIT 5;
    `;
  
    const fileSql = `
      SELECT file_name AS label, 'file' AS type
      FROM uploads
      WHERE file_name ILIKE $1 OR description ILIKE $1
      LIMIT 5;
    `;
  
    try {
      const [userRes, fileRes] = await Promise.all([
        pool.query(userSql, [key]),
        pool.query(fileSql, [key]),
      ]);
  
      res.json([...userRes.rows, ...fileRes.rows]);
    } catch (e) {
      console.error("자동완성 쿼리 실패:", e);
      res.status(500).json({ error: "서버 오류" });
    }

    console.log("🔍 Suggest 요청:", keyword);
    console.log("👤 사용자 결과:", userRes.rows);
    console.log("📁 파일 결과:", fileRes.rows);
    
  });

export default router;
