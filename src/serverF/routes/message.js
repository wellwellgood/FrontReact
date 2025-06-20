// routes/message.js (ESM 버전)
import express from "express";
import messageController from "../chatServer/controllers/messageController.js";

const router = express.Router();

// 저장
router.post("/messages", messageController.saveMessage);
// 조회
router.get("/messages", messageController.getMessages);
// 읽음 처리 (전체)
router.post("/messages/read", messageController.markAllAsRead);
// 개별 읽음 처리
router.post("/messages/:messageId/read", messageController.markMessageAsRead);

export default router;
