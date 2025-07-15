app.get('/health', (req, res) => {
    const healthCheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: new Date().toISOString(),
      status: 'healthy'
    };
    
    try {
      res.status(200).json(healthCheck);
    } catch (error) {
      healthCheck.message = error.message;
      healthCheck.status = 'error';
      res.status(503).json(healthCheck);
    }
  });
  
  // 더 상세한 헬스 체크 (선택사항)
  app.get('/health/detailed', async (req, res) => {
    const healthCheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {
        database: 'OK',
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    };
    
    try {
      // 데이터베이스 연결 확인 (예시)
      // await db.query('SELECT 1');
      
      res.status(200).json(healthCheck);
    } catch (error) {
      healthCheck.message = error.message;
      healthCheck.status = 'error';
      healthCheck.checks.database = 'ERROR';
      res.status(503).json(healthCheck);
    }
  });
  
  // 백엔드 서버가 시작될 때 로그
  console.log('🏥 헬스 체크 엔드포인트 활성화: /health');