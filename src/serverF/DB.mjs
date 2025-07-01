// DB.js
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

// PostgreSQL 커넥션 풀 설정
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});
// console.log("🔐 DB 비밀번호:", process.env.DB_PASSWORD);

// 연결 테스트 함수 (선택)
const connectDB = async () => {
  try {
    const client = await pool.connect();
    // console.log("✅ DB 풀 연결 성공");
    client.release(); // 연결 반환
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

export default pool;
export { connectDB };