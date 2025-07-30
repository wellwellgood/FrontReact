import express from 'express';
import multer from 'multer';
import R2 from '../uploads/chat/R2.js';
import dbPool from '../DB.mjs';   // ✅ DB Pool 직접 import

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    // console.log("📥 [1] 업로드 요청 도착");
    // console.log("📂 req.body:", req.body);
    // console.log("📂 req.file:", req.file ? req.file.originalname : "❌ 없음");

    const file = req.file;
    const roomId = req.body.roomId || 'defaultRoom';
    const sender = req.body.sender || 'unknown';

    if (!file) {
      // console.warn("⚠️ [2] 파일 없음");
      return res.status(400).json({ success: false, error: '파일 없음' });
    }

    const key = `chat/${roomId}/${Date.now()}-${file.originalname}`;
    // console.log("🔑 [3] R2 업로드 Key:", key);

    await R2.putObject({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }).promise();
    // console.log("✅ [4] R2 업로드 성공");

    // ✅ Signed URL 생성
    const signedUrl = R2.getSignedUrl('getObject', {
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Expires: 3600, // 1시간
    });
    // console.log("🌐 [5] Signed URL:", signedUrl);

    // ✅ DB 저장
    await dbPool.query(
      'INSERT INTO chat_messages (room_id, sender, message_type, content) VALUES ($1, $2, $3, $4)',
      [roomId, sender, 'file', signedUrl]
    );
    // console.log("✅ [6] DB 저장 성공");

    res.json({ success: true, url: signedUrl });
  } catch (err) {
    console.error('❌ [7] 채팅 파일 업로드 실패:', err.stack || err);
    res.status(500).json({ 
      success: false, 
      error: err.message, 
      stack: err.stack 
    });
  }

  router.get('/download', async (req, res) => {
    try {
      const key = req.query.key;
      console.log("📥 다운로드 요청:", key);
  
      const fileStream = R2.getObject({
        Bucket: process.env.R2_BUCKET,
        Key: key,
      }).createReadStream();
  
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(key.split('/').pop())}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      fileStream.pipe(res);
    } catch (err) {
      console.error('❌ 다운로드 실패:', err);
      res.status(500).json({ error: '파일 다운로드 실패' });
    }
  });
});

export default router;
