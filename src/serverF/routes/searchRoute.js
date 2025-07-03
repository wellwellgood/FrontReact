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
    return res.json([]); // 빈 값이면 빈 배열 리턴
  }

  try {
    const key = `%${keyword}%`;

    const userSql = `
      SELECT name AS label, 'user' AS type FROM users
      WHERE username ILIKE $1 OR name ILIKE $1
      LIMIT 5;
    `;
    const fileSql = `
      SELECT file_name AS label, 'file' AS type FROM uploads
      WHERE file_name ILIKE $1 OR description ILIKE $1
      LIMIT 5;
    `;

    const [userResult, fileResult] = await Promise.all([
      client.query(userSql, [key]),
      client.query(fileSql, [key]),
    ]);

    const suggestions = [...userResult.rows, ...fileResult.rows];
    res.json(suggestions);
  } catch (err) {
    console.error("❌ 자동완성 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

export default router;
