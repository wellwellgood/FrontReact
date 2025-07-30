import express from 'express';
import multer from 'multer';
import r2 from '../uploads/chat/R2.js';
import db from '../routes/neonPostgre.js';  // Neon PostgreSQL 연결

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    console.log("📥 [1] 업로드 요청 도착");
    console.log("📂 req.body:", req.body);
    console.log("📂 req.file:", req.file ? req.file.originalname : "❌ 없음");

    const file = req.file;
    const roomId = req.body.roomId;
    const sender = req.body.sender;

    if (!file) {
      console.warn("⚠️ [2] 파일 없음");
      return res.status(400).json({ success: false, error: '파일 없음' });
    }

    const key = `chat/${roomId}/${Date.now()}-${file.originalname}`;
    console.log("🔑 [3] R2 업로드 Key:", key);

    // ✅ R2에 업로드
    try {
      await r2.putObject({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }).promise();
      console.log("✅ [4] R2 업로드 성공");
    } catch (r2err) {
      console.error("❌ [4] R2 업로드 실패:", r2err.message);
      throw r2err;
    }

    const fileUrl = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}/${key}`;
    console.log("🌐 [5] 파일 URL:", fileUrl);

    // ✅ DB에 저장
    try {
      await db.query(
        'INSERT INTO chat_messages (room_id, sender, message_type, content) VALUES ($1, $2, $3, $4)',
        [roomId, sender, 'file', fileUrl]
      );
      console.log("✅ [6] DB 저장 성공");
    } catch (dberr) {
      console.error("❌ [6] DB 저장 실패:", dberr.message);
      throw dberr;
    }

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
