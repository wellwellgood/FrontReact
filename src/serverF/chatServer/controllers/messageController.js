// controllers/messageController.js
const express = require("express");
const router = express.Router();
const db = require("./db.js");

const time = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Seoul" }).replace(' ', 'T');
// ✅ 메시지 저장
exports.saveMessage = async (req, res) => {
  const {
    sender_username,
    receiver_username,
    receiver_name,
    content,
    file_url,
    file_name,
    file_size
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO messages (
        sender_username, receiver_username, receiver_name,
        content, file_url, file_name, file_size, read, time
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW()) RETURNING *`,
      [
        sender_username,
        receiver_username,
        receiver_name,
        content,
        file_url,
        file_name,
        Number(file_size) || 0,
        time
      ]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("❌ 메시지 저장 실패:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ 메시지 조회
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

// ✅ 읽음 처리 (전체 읽음)
exports.markAllAsRead = async (req, res) => {
  const { sender_username, receiver_username } = req.body;

  try {
    await db.query(
      `UPDATE messages
       SET read = true
       WHERE sender_username = $1 AND receiver_username = $2`,
      [sender_username, receiver_username]
    );

    res.status(200).json({ message: "모든 메시지가 읽음 처리되었습니다." });
  } catch (err) {
    console.error("❌ 읽음 처리 실패:", err);
    res.status(500).json({ error: "읽음 처리 실패" });
  }
};

// ✅ 개별 메시지 읽음 처리 (선택적 구현)
exports.markMessageAsRead = async (req, res) => {
  const { messageId } = req.params;

  try {
    await db.query(
      "UPDATE messages SET read = true WHERE id = $1",
      [messageId]
    );

    res.status(200).json({ message: "해당 메시지가 읽음 처리되었습니다." });
  } catch (err) {
    console.error("❌ 개별 메시지 읽음 실패:", err);
    res.status(500).json({ error: "개별 읽음 처리 실패" });
  }
};
