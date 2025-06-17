// routes/message.js
const express = require('express');
const router = express.Router();
const messageController = require('../chatServer/controllers/messageController');

/**
 * @route POST /api/messages
 * @desc Save a new chat message (supports text & file)
 * @access Public
 */
router.post(
  '/',
  messageController.uploadMiddleware, // ✅ multer parses multipart/form‑data first
  messageController.saveMessage       // ✅ then run business logic
);

/**
 * @route GET /api/messages
 * @desc Retrieve all chat messages ordered by time
 * @access Public
 */
router.get('/', messageController.getMessages);

module.exports = router;
