const express = require('express');
const router = express.Router();

router.post('/', saveMessage);
router.get('/', getMessages);

module.exports = router;
