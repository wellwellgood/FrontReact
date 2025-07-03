import express from "express";
import { pool } from "../DB.mjs";

const router = express.Router();

// 🔍 자동완성 API
router.get("/suggest", async (req, res) => {
    console.log("🔍 자동완성 요청 받음:", req.query); // 디버깅 로그
    
    const { keyword } = req.query;
    if (!keyword) {
        console.log("❌ 키워드가 없음");
        return res.json([]);
    }

    const key = `%${keyword}%`;
    console.log("🔑 검색 키워드:", key);

    try {
        // DB 연결 테스트
        const testQuery = await pool.query('SELECT 1 as test');
        console.log("✅ DB 연결 성공:", testQuery.rows);

        const [userRes, fileRes, contentRes] = await Promise.all([
            pool.query(`SELECT username, name FROM users WHERE username ILIKE $1 OR name ILIKE $1 LIMIT 5`, [key]),
            pool.query(`SELECT file_name FROM messages WHERE file_name ILIKE $1 LIMIT 5`, [key]),
            pool.query(`SELECT content FROM messages WHERE content ILIKE $1 LIMIT 5`, [key]),
        ]);

        console.log("👥 사용자 결과:", userRes.rows);
        console.log("📁 파일 결과:", fileRes.rows);
        console.log("💬 내용 결과:", contentRes.rows);

        const suggestions = [
            ...userRes.rows.map(u => ({ type: "user", label: u.name || u.username })),
            ...fileRes.rows.map(f => ({ type: "file", label: f.file_name })),
            ...contentRes.rows.map(c => ({ type: "content", label: c.content?.substring(0, 50) + "..." })),
        ];

        console.log("📝 최종 제안:", suggestions);
        res.json(suggestions);
    } catch (err) {
        console.error("❌ 자동완성 실패:", err.message);
        console.error("📚 상세 에러:", err);
        res.status(500).json({ error: err.message });
    }
});

// 🔎 전체 검색 API
router.get("/", async (req, res) => {
    console.log("🔎 전체 검색 요청 받음:", req.query);
    
    const { query } = req.query;
    if (!query) {
        console.log("❌ 쿼리가 없음");
        return res.json([]);
    }
  
    const key = `%${query}%`;
    console.log("🔑 검색 쿼리:", key);
  
    try {
        // DB 연결 테스트
        const testQuery = await pool.query('SELECT 1 as test');
        console.log("✅ DB 연결 성공:", testQuery.rows);

        const [userRes, fileRes, contentRes] = await Promise.all([
            pool.query(`SELECT 'user' AS type, id, username, name FROM users WHERE username ILIKE $1 OR name ILIKE $1`, [key]),
            pool.query(`SELECT 'file' AS type, id, file_name FROM messages WHERE file_name ILIKE $1`, [key]),
            pool.query(`SELECT 'content' AS type, id, content FROM messages WHERE content ILIKE $1`, [key]),
        ]);

        console.log("👥 사용자 검색 결과:", userRes.rows);
        console.log("📁 파일 검색 결과:", fileRes.rows);
        console.log("💬 내용 검색 결과:", contentRes.rows);
  
        const allResults = [...userRes.rows, ...fileRes.rows, ...contentRes.rows];
        console.log("🔎 전체 검색 결과:", allResults);
        res.json(allResults);
    } catch (err) {
        console.error("❌ 검색 실패:", err.message);
        console.error("📚 상세 에러:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;