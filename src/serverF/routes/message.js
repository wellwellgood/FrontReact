const express = require("express");
const router = express.Router();
const messageController = require("../chatServer/controllers/messageController.js");

// 저장
router.post("/messages", messageController.saveMessage);
// 조회
router.get("/messages", messageController.getMessages);
// 읽음 처리 (전체)
router.post("/messages/read", messageController.markAllAsRead);
// 개별 읽음 처리
router.post("/messages/:messageId/read", messageController.markMessageAsRead);

module.exports = router;