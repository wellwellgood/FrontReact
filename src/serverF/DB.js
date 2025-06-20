// DB.js
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 60000,
});

export default pool;

export async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    await client.query("SELECT NOW()");
    console.log("✅ DB 연결 성공");
    return true;
  } catch (err) {
    console.error("❌ DB 연결 실패:", err.message);
    return false;
  } finally {
    if (client) client.release();
  }
}
