import express from "express";
import messageController from "../chatServer/controllers/messageController.js";

const router = express.Router();

// 저장
router.post("/", messageController.saveMessage);
// 조회
router.get("/", messageController.getMessages);
// 읽음 처리 (전체)
router.post("/read", messageController.markAllAsRead);
// 개별 읽음 처리
router.post("/:messageId/read", messageController.markMessageAsRead);

export default router;