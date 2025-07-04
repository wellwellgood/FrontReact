// ✅ DB.mjs - 충돌 해결
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

// pool 변수 이름 중복 방지 (pool → dbPool 등)
const dbPool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://neondb_owner:zLsRmsjkEJIPDoUHTFRnzpGUjZxVVfAy@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
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

setInterval(async () => {
  try {
    await dbPool.query("SELECT 1");
  } catch (err) {
    console.log("🔁 DB ping 실패:", err.message);
  }
}, 1000 * 60 * 4.5);

export default dbPool;         // ✅ default로 내보내기
export { connectDB };         // ✅ connectDB는 named export
