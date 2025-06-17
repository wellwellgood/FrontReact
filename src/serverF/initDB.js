// initDB.js
const pool = require("./DB"); // pg는 그냥 pool로 가져옴

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

const initDB = async (retryCount = 0) => {
  let client;
  try {
    client = await pool.connect(); // ✅ PostgreSQL 방식

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY, -- ✅ PostgreSQL의 자동 증가 필드
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(50),
        phone1 VARCHAR(10),
        phone2 VARCHAR(10),
        phone3 VARCHAR(10)
      )
    `;

    await client.query(createTableQuery);
    console.log("✅ users 테이블 생성 완료");
    return true;

  } catch (err) {
    console.error(`❌ DB 초기화 실패 (시도 ${retryCount + 1}/${MAX_RETRIES}):`, err.message);

    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 ${RETRY_DELAY / 1000}초 후 DB 초기화 재시도...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return initDB(retryCount + 1);
    } else {
      console.error(`❌ 최대 재시도 횟수(${MAX_RETRIES}) 초과. DB 초기화 실패.`);
      return false;
    }
  } finally {
    if (client) client.release(); // ✅ pg도 release는 동일하게 사용
  }
};

module.exports = initDB;
