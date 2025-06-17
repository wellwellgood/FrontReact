// controllers/messageController.js
const db = require("./db.js"); // 경로 수정 (controllers 폴더에 있다면)
// 또는 const db = require("./db.js"); // db.js가 같은 폴더에 있다면
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads"); // 경로 수정
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const cleaned = file.originalname.trim().replace(/\s+/g, "_");
    const uniqueName = Date.now() + "-" + cleaned;
    cb(null, uniqueName);
  },
});
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB 제한
  }
});
exports.uploadMiddleware = upload.single("file");

// ✅ 메시지 저장
exports.saveMessage = async (req, res) => {
  console.log("📦 req.body:", req.body);
  console.log("📁 req.file:", req.file);

  const { sender_username, receiver_username, receiver_name, content = "[파일]" } = req.body;
  const file = req.file;

  if (!sender_username || !receiver_username || !receiver_name) {
    return res.status(400).json({ message: "필수 정보 누락" });
  }

  try {
    const fileUrl = file ? `/uploads/${file.filename}` : null;
    const fileName = file?.originalname?.trim().replace(/\s+/g, "_") || null;

    const result = await db.query(
      `INSERT INTO messages (sender_username, receiver_username, receiver_name, content, fileUrl, file_name, time, file) 
       VALUES ($1, $2, $3, $4, $5, $6, %7, NOW()) RETURNING *`,
      [sender_username, receiver_username, receiver_name, content.trim(), fileUrl, fileName, file]
    );

    const savedMessage = result.rows[0];

    res.status(200).json({
      id: savedMessage.id,
      sender_username: savedMessage.sender_username,
      receiver_username: savedMessage.receiver_username,
      receiver_name: savedMessage.receiver_name,
      content: savedMessage.content,
      file: file?.filename || null,
      file,
      file_name: savedMessage.file_name,
      fileUrl: file ? `${req.protocol}://${req.get("host")}/uploads/${file.filename}` : null,
      time: savedMessage.time,
      read: savedMessage.read || false,
    });
  } catch (err) {
    console.error("❌ 메시지 저장 실패:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// ✅ 메시지 조회
exports.getMessages = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM messages ORDER BY time");
    const rows = result.rows;
    
    // 파일 URL을 완전한 URL로 변환
    const messagesWithFullUrls = rows.map(message => ({
      ...message,
      fileUrl: message.file_url ? `${req.protocol}://${req.get("host")}${message.file_url}` : null
    }));
    
    res.status(200).json(messagesWithFullUrls);
  } catch (err) {
    console.error("❌ 메시지 조회 실패:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// ✅ 메시지 읽음 처리
exports.markAsRead = async (req, res) => {
  const { messageId } = req.params;
  
  try {
    await db.query(
      "UPDATE messages SET read = true WHERE id = $1",
      [messageId]
    );
    
    res.status(200).json({ message: "메시지가 읽음 처리되었습니다." });
  } catch (err) {
    console.error("❌ 메시지 읽음 처리 실패:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};