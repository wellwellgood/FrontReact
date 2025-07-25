import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { bucket } from "../firebase.js";

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

// ✅ Firebase 파일 목록 조회 (Admin SDK 방식)
router.get("/", async (req, res) => {
  try {
    const [files] = await bucket.getFiles({ prefix: "files/" });

    const fileList = files.map((file) => ({
      file_name: file.name.replace("files/", ""),
      url: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
      uploadedAt: file.metadata.timeCreated,
    }));

    res.status(200).json({ files: fileList });
  } catch (err) {
    console.error("🔥 파일 목록 불러오기 실패:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/upload", async (req, res) => {
  try {
    const [files] = await bucket.getFiles({ prefix: "files/" });
    res.json(files.map(file => file.name));
  } catch (err) {
    console.error("🔥 파일 목록 불러오기 실패:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const localFile = req.file.path;
    const destFile = `files/${req.file.filename}`;

    await bucket.upload(localFile, {
      destination: destFile,
      metadata: { contentType: req.file.mimetype }
    });

    res.status(200).json({ message: "✅ 업로드 성공", file: destFile });
  } catch (err) {
    console.error("🔥 업로드 실패:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

export default router;
