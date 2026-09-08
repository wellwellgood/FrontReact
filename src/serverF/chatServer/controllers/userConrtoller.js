const db = require('../db');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashed]);
    res.status(201).send('✅ 회원가입 성공');
  } catch (err) {
    res.status(500).send('❌ 에러: ' + err.message);
  }
};

exports.getUsers = async (req, res) => {
  const excludeUsername = req.query.exclude;
  try {
    const [users] = await db.query(
      "SELECT username, name FROM users WHERE username IS NOT NULL AND username != ?",
      [excludeUsername]
    );
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ 유저 목록 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

