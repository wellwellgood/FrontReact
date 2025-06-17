// DB.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 60000,
});

// ✅ 연결 확인용 함수
async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    await client.query("SELECT NOW()");
    console.log("✅ DB 연결 성공");
    return true; // ✅ 반드시 true 반환
  } catch (err) {
    console.error("❌ DB 연결 실패:", err.message);
    return false; // ✅ 실패 시 false
  } finally {
    if (client) client.release();
  }
}

// ✅ 필요한 것들 내보내기
module.exports = pool;
module.exports.testConnection = testConnection;
