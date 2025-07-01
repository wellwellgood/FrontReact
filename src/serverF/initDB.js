import pkg from "pg";
const { Client } = pkg;
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

const initDB = async () => {
  try {
    await client.connect();
    // console.log("✅ DB 연결 성공");

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
      );
    `;

    await client.query(createUsersTable);
    // console.log("✅ users 테이블 생성 완료");
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

export default initDB;
export { client };
