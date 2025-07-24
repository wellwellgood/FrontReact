import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../firebaseConfig.js';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Router } from "express";
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";
import { storage } from "../fileBaseConfig.js";

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

router.get("/", async (req, res) => {
  try {
    const listRef = ref(storage, "files");
    const response = await listAll(listRef);

    const files = await Promise.all(
      response.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        const meta = await getMetadata(itemRef);
        return {
          file_name: itemRef.name,
          url,
          uploadedAt: meta.timeCreated,
          type: meta.contentType,
        };
      })
    );

    // 최신순 정렬
    const sorted = files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.json({
      success: true,
      files: sorted,
    });
  } catch (error) {
    console.error("❌ Firebase 파일 목록 오류:", error);
    res.status(500).json({ success: false, error: "파일 목록 가져오기 실패" });
  }
});


export default router;