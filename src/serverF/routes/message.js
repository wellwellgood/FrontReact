// routes/message.js
const express = require("express");
const router = express.Router();
const {
  saveMessage,
  getMessages,
} = require("../chatServer/controllers/messageController.js");

// ✅ uploadMiddleware 제거
router.post("/", saveMessage);
router.get("/", getMessages);

module.exports = router;