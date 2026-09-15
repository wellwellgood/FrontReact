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
});

const connectDB = async () => {
  try {
    const client = await dbPool.connect();
    client.release();
  } catch (err) {
    console.error("❌ DB 연결 실패:", err.message);
    throw err;
  }
};

// 4분 30초마다 연결 확인
setInterval(async () => {
  try {
    await dbPool.query("SELECT 1");
  } catch (err) {
    console.log("🔁 DB ping 실패:", err.message);
  }
}, 1000 * 60 * 4.5);

export default dbPool;
export { connectDB };