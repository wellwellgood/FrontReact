// db.js
const { Pool } = require('pg');
require("dotenv").config();

// 환경변수에서 DATABASE_URL 가져오기
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_S16FMnctoDIp@ep-proud-star-a1nvdvwj-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

// PostgreSQL 연결 풀 생성
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Neon DB의 경우 필요
  },
});

// 연결 테스트
pool.on('connect', () => {
  console.log('✅ PostgreSQL 데이터베이스에 연결되었습니다.');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL 연결 오류:', err);
});

// 쿼리 실행 함수
const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('❌ 쿼리 실행 오류:', error);
    throw error;
  }
};

// 연결 종료 함수
const end = async () => {
  await pool.end();
  console.log('📊 데이터베이스 연결이 종료되었습니다.');
};

module.exports = {
  query: (text, params) => pool.query(text, params),  // ✅ query 직접 export
  pool,
};