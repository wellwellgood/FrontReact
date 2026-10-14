import express from 'express';
import jwt from 'jsonwebtoken';
import { getKisQuotes } from '../services/kis.js';
const router = express.Router();
router.get('/quotes', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  if (!process.env.KIS_ALLOWED_USERNAME || !process.env.JWT_SECRET) return res.status(503).json({ message: '서버에 시세 조회 계정 설정이 필요합니다.' });
  try {
    const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
    const user = jwt.verify(token || '', process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (user.username !== process.env.KIS_ALLOWED_USERNAME) return res.status(403).json({ message: '본인 계정에만 시세 조회가 허용됩니다.' });
  } catch { return res.status(401).json({ message: '다시 로그인해 주세요.' }); }
  try { res.json(await getKisQuotes()); }
  catch (error) { res.status(503).json({ message: error.message }); }
});
export default router;
