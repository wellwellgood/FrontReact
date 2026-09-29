import pool from "./DB.mjs";

// 기존 풀을 사용해 초기화 이후에도 별도 연결이 남지 않도록 합니다.
const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(32),
      phone1 VARCHAR(8),
      phone2 VARCHAR(8),
      phone3 VARCHAR(8)
    );
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(32);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone1 VARCHAR(8);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone2 VARCHAR(8);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone3 VARCHAR(8);
  `);
};

export default initDB;
