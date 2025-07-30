import express from 'express';
import multer from 'multer';
import r2 from '../uploads/chat/R2.js';
import dbPool from '../DB.mjs';   // ✅ DB Pool 직접 import

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    console.log("📥 [1] 업로드 요청 도착");
    console.log("📂 req.body:", req.body);
    console.log("📂 req.file:", req.file ? req.file.originalname : "❌ 없음");

    const file = req.file;
    const roomId = req.body.roomId || 'defaultRoom';
    const sender = req.body.sender || 'unknown';

    if (!file) {
      console.warn("⚠️ [2] 파일 없음");
      return res.status(400).json({ success: false, error: '파일 없음' });
    }

    const key = `chat/${roomId}/${Date.now()}-${file.originalname}`;
    console.log("🔑 [3] R2 업로드 Key:", key);

    await r2.putObject({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }).promise();
    console.log("✅ [4] R2 업로드 성공");

    const fileUrl = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}/${key}`;
    console.log("🌐 [5] 파일 URL:", fileUrl);

    await dbPool.query(
      'INSERT INTO chat_messages (room_id, sender, message_type, content) VALUES ($1, $2, $3, $4)',
      [roomId, sender, 'file', fileUrl]
    );
    console.log("✅ [6] DB 저장 성공");

    res.json({ success: true, url: fileUrl });
  } catch (err) {
    console.error('❌ [7] 채팅 파일 업로드 실패:', err.stack || err);
    res.status(500).json({ 
      success: false, 
      error: err.message, 
      stack: err.stack 
    });
  }
});

export default router;
