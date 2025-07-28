// routes/chatUploadRouter.js
import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = Router();

// 📂 업로드 폴더 설정
const uploadDir = "./uploads/chat";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// 📌 multer 설정 (서버 로컬 저장)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// ✅ 채팅 파일 업로드 전용
router.post("/", upload.single("file"), (req, res) => {
  try {
    const filePath = `/uploads/chat/${req.file.filename}`;
    console.log("📂 채팅 파일 업로드:", req.file.filename);

    res.status(200).json({
      success: true,
      url: `/uploads/chat/${req.file.filename}`,
      file_name: req.file.originalname,
      file_size: req.file.size
    });
  } catch (err) {
    console.error("❌ 채팅 파일 업로드 실패:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
