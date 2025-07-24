import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { storage } from "../../firebase.js";

const router = Router();
const uploadDir = "./uploads";

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + file.originalname;
    cb(null, unique);
  }
});

const upload = multer({ storage: diskStorage });

// ✅ Firebase 파일 목록 조회
router.get("/", async (req, res) => {
  try {
    const [files] = await storage.getFiles({ prefix: "files/" });

    const fileList = files.map((file) => ({
      file_name: file.name.replace("files/", ""),
      url: `https://storage.googleapis.com/${storage.name}/${file.name}`,
      uploadedAt: file.metadata.timeCreated,
    }));

    res.status(200).json({ files: fileList });
  } catch (err) {
    console.error("🔥 파일 목록 불러오기 실패:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;