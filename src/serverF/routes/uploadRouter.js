import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../firebaseConfig.js';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const router = express.Router();

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${timestamp}-${base}${ext}`);
  }
});
const upload = multer({ storage });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false });

    const fileData = {
      file_name: req.file.filename.split(/-(.+)/)[1] || req.file.filename,
      name: req.file.filename,
      type: 'uploaded',
      uploadedAt: new Date().toISOString(),
    };

    await addDoc(collection(db, 'uploadedFiles'), fileData);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ 업로드 실패:', err);
    res.status(500).json({ success: false });
  }
});

router.get('/', async (req, res) => {
  const snapshot = await getDocs(collection(db, 'uploadedFiles'));
  const files = snapshot.docs.map(doc => doc.data());
  res.json({ success: true, files });
});

export default router;