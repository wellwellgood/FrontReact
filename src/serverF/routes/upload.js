import express from 'express';
import multer from 'multer';
import r2 from '../uploads/chat/R2.js';
import db from '../routes/neonPostgre.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });  // ✅ 메모리 스토리지

router.post('/upload-profile', upload.single('file'), async (req, res) => {
  console.log('📥 업로드 요청 받음');
  console.log('req.file:', req.file);
  console.log('req.body.username:', req.body.username);

  if (!req.file) {
    return res.status(400).json({ success: false, error: '파일 없음' });
  }

  const file = req.file;
  const username = req.body.username;
  const key = `profiles/${Date.now()}-${file.originalname}`;

  try {
    // ✅ R2 업로드
    await r2.putObject({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }).promise();

    console.log('✅ R2 업로드 성공:', key);

    const fileUrl = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}/${key}`;

    // ✅ Neon DB에 URL 저장
    await db.query(
      'UPDATE users SET profile_image=$1 WHERE username=$2',
      [fileUrl, username]
    );

    res.json({ success: true, url: fileUrl });
  } catch (err) {
    console.error('❌ R2 업로드 실패:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
