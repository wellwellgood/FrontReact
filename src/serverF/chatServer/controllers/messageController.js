// controllers/messageController.js
const db = require("./db.js");

// ✅ multer 관련 코드 제거됨

// ✅ 메시지 저장 (Firebase 업로드 완료 후 호출됨)
exports.saveMessage = async (req, res) => {
  const {
    sender_username,
    receiver_username,
    receiver_name,
    content,
    fileurl,
    file_name
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO messages (sender_username, receiver_username, receiver_name, content, fileurl, file_name, time)
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      [sender_username, receiver_username, receiver_name, content, fileurl, file_name]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("❌ 메시지 저장 실패:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ 메시지 조회 (file_url 그대로 사용)
exports.getMessages = async (req, res) => {
  const { username, target } = req.query;

  if (!username || !target) {
    return res.status(400).json({ message: "필수 파라미터 누락" });
  }

  try {
    const result = await db.query(
      `SELECT * FROM messages 
       WHERE (sender_username = $1 AND receiver_username = $2)
          OR (sender_username = $2 AND receiver_username = $1)
       ORDER BY time`,
      [username, target]
    );

    res.status(200).json(result.rows);
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
