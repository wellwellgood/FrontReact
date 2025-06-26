// DB.js
import pkg from "pg";
const { Client } = pkg;
import dotenv from "dotenv";

// ✅ 그냥 기본 .env 불러오도록 수정
dotenv.config();

// PostgreSQL 클라이언트 설정
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});
console.log("🔐 DB 비밀번호:", process.env.DB_PASSWORD);

const connectDB = async () => {
  try {
    await client.connect();
    console.log("✅ DB 연결 성공");
  } catch (err) {
    console.error("❌ DB 연결 실패:", err.message);
    throw err;
  }
};

export { client, connectDB };
