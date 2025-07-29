import express from 'express';
import multer from 'multer';
import r2 from '../uploads/chat/R2.js';
import db from '../routes/neonPostgre.js';  // Neon PostgreSQL 연결

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-chat', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const roomId = req.body.roomId;
    const sender = req.body.sender;

    if (!file) {
      return res.status(400).json({ success: false, error: '파일 없음' });
    }

    const key = `chat/${roomId}/${Date.now()}-${file.originalname}`;

    // ✅ R2에 업로드
    await r2.putObject({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }).promise();

    const fileUrl = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}/${key}`;

    // ✅ 채팅 DB에 URL 저장
    await db.query(
      'INSERT INTO chat_messages (room_id, sender, message_type, content) VALUES ($1, $2, $3, $4)',
      [roomId, sender, 'file', fileUrl]
    );

    res.json({ success: true, url: fileUrl });
  } catch (err) {
    console.error('❌ 채팅 파일 업로드 실패:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
