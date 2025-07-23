import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../../firebase.js"; // Firebase 초기화 모듈
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");
const imagesDir = path.join(uploadDir, "images");
const docsDir = path.join(uploadDir, "docs");

[uploadDir, imagesDir, docsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(ext)) {
      cb(null, imagesDir);
    } else if ([".pdf", ".docx", ".doc", ".hwp", ".txt"].includes(ext)) {
      cb(null, docsDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${timestamp}-${base}${ext}`);
  },
});
const upload = multer({ storage });

const getFileType = (ext) => {
  if ([".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(ext)) return "images";
  if ([".pdf", ".docx", ".doc", ".hwp", ".txt"].includes(ext)) return "docs";
  return "others";
};

// 📤 업로드
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false });

    const ext = path.extname(req.file.originalname).toLowerCase();
    const uploadedAt = new Date();

    const meta = {
      type: getFileType(ext),
      file_name: req.file.filename.split(/-(.+)/)[1] || req.file.filename,
      name: req.file.filename,
      uploadedAt: uploadedAt.toISOString(),
    };

    await addDoc(collection(db, "uploadedFiles"), meta);

    res.status(200).json({ success: true, fileName: req.file.filename });
  } catch (err) {
    console.error("🔥 업로드 실패:", err);
    res.status(500).json({ success: false });
  }
});

// 📄 파일 목록 (Firebase에서 가져옴)
router.get("/", async (req, res) => {
  try {
    const q = query(collection(db, "uploadedFiles"), orderBy("uploadedAt", "desc"));
    const snapshot = await getDocs(q);
    const files = snapshot.docs.map((doc) => doc.data());
    res.status(200).json({ success: true, files });
  } catch (err) {
    console.error("🔥 목록 조회 실패:", err);
    res.status(500).json({ success: false });
  }
});

export default router;
