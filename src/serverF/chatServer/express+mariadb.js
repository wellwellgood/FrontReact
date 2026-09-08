require('dotenv').config(); // 꼭 맨 위에 추가

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectionLimit: 20,
});

module.exports = pool;

(async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log("✅ DB 연결 성공");
    const [rows] = await conn.query("SELECT DATABASE() AS db");
    console.log("📌 현재 DB:", rows[0].db);
  } catch (err) {
    console.error("❌ DB 연결 실패:", err);
  } finally {
    if (conn) conn.release();
  }
})();