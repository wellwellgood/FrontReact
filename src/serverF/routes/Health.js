const express = require('express');
const router = express.Router();

// 기본 헬스 체크
router.get('/', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: '1.0.0'
  };
  
  try {
    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.message = error.message;
    healthCheck.status = 'error';
    res.status(503).json(healthCheck);
  }
});

// 상세 헬스 체크
router.get('/detailed', async (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      database: 'OK',
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      env: process.env.NODE_ENV || 'development'
    }
  };
  
  try {
    // 데이터베이스 연결 확인 (실제 DB 쿼리로 교체)
    // if (db) {
    //   await db.query('SELECT 1');
    // }
    
    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.message = error.message;
    healthCheck.status = 'error';
    healthCheck.checks.database = 'ERROR';
    res.status(503).json(healthCheck);
  }
});

module.exports = router;