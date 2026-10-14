require('dotenv').config(); // ⬅️ .env 파일 불러오기

const mariadb = require('mariadb');
const { Pool } = require('pg');

// ✅ MariaDB 연결
const mariaPool = mariadb.createPool({
    host: process.env.MARIADB_HOST,
    port:5432, // ✅ 반드시 숫자로 변환!
    user: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_NAME,
    allowPublicKeyRetrieval: true,
  });;

// ✅ Neon(PostgreSQL) 연결
const pgPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

async function transferUsers() {
  try {
    const mariaConn = await mariaPool.getConnection();
    const users = await mariaConn.query('SELECT * FROM users');
    mariaConn.release();

    console.log(`✅ MariaDB에서 ${users.length}개 유저 로드됨`);

    for (const user of users) {
      await pgPool.query(
        'INSERT INTO users (id, username, password) VALUES ($1, $2, $3)',
        [user.id, user.username , user.password]
      );
      console.log(`➡️ 유저 ${user.username} -> Neon 저장됨`);
    }

    console.log('🎉 모든 사용자 전송 완료!');
  } catch (err) {
    console.error('❌ 데이터 이전 중 오류:', err);
  } finally {
    await mariaPool.end();
    await pgPool.end();
  }
}

transferUsers();
