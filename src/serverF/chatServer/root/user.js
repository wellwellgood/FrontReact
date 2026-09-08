const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 회원가입 API
router.post('/register', userController.register);

// 로그인 API (구현 예정이면 일단 생략 가능)
// router.post('/login', userController.login);

module.exports = router;
