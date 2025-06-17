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
