import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;

// DB.mjs와 같은 폴더의 .env 불러오기
dotenv.config({
  path: new URL("./.env", import.meta.url),
});

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL 환경변수가 없습니다.");
}

const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
});

const connectDB = async () => {
  try {
    console.log("⏳ DB 연결 확인 중...");
    const client = await dbPool.connect();
    client.release();
    console.log("✅ DB 연결 완료");
  } catch (err) {
    console.error("❌ DB 연결 실패:", err.message);
    throw err;
  }
};

// 주기적인 ping 없이 실제 요청에서 풀의 연결을 사용합니다.

export default dbPool;
export { connectDB };
