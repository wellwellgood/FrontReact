import express from 'express';
import multer from 'multer';
import r2 from '../uploads/chat/R2.js';
import db from '../routes/neonPostgre.js';  // Neon PostgreSQL 연결 모듈

const router = express.Router();
const upload = multer();

router.post('/upload-profile', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const username = req.body.username;
    const key = `profiles/${Date.now()}-${file.originalname}`;

    // ✅ R2 업로드
    await r2.putObject({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }).promise();

      console.log('✅ R2 업로드 성공:', key);


      const fileUrl = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}/${key}`;

    // ✅ Neon DB 업데이트 (users 테이블에 profile_image 컬럼 있다고 가정)
    await db.query(
        'UPDATE users SET profile_image=$1 WHERE username=$2',
        [fileUrl, username]
      );

      res.json({ success: true, url: fileUrl });
    } catch (err) {
      console.error('❌ R2 업로드 실패:', err);
      res.status(500).json({ success: false, error: 'R2 업로드 실패' });
    }
});

export default router;
