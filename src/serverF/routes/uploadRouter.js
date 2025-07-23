// routes/uploadRouter.js (ESM)
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");
const imagesDir = path.join(uploadDir, "images");
const docsDir = path.join(uploadDir, "docs");
const metaFile = path.join(uploadDir, "fileMeta.json");

// 폴더들 없으면 생성
[uploadDir, imagesDir, docsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 메타데이터 불러오기
let fileMetadata = [];
if (fs.existsSync(metaFile)) {
  try {
    fileMetadata = JSON.parse(fs.readFileSync(metaFile, "utf-8"));
  } catch (e) {
    console.error("❌ 메타파일 읽기 실패:", e);
    fileMetadata = [];
  }
}

const saveMetadata = () => {
  fs.writeFileSync(metaFile, JSON.stringify(fileMetadata, null, 2));
};

// multer 설정
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

// 🔼 업로드
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "파일이 업로드되지 않았습니다." });
  }

  const uploadedAt = new Date();
  const ext = path.extname(req.file.originalname).toLowerCase();
  const type = [".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(ext)
    ? "images"
    : [".pdf", ".docx", ".doc", ".hwp", ".txt"].includes(ext)
    ? "docs"
    : "others";

  const meta = {
    type,
    name: req.file.filename,
    file_name: req.file.filename.split(/-(.+)/)[1] || req.file.filename,
    uploadedAt,
  };

  fileMetadata.push(meta);
  saveMetadata();

  res.status(200).json({ success: true, fileName: req.file.filename });
});

// 🔽 파일 목록
router.get("/", (req, res) => {
  res.status(200).json({ success: true, files: fileMetadata });
});

// 📥 파일 다운로드
router.get("/download/:type/:filename", (req, res) => {
  const { type, filename } = req.params;
  const baseDir = type === "images" ? imagesDir : type === "docs" ? docsDir : uploadDir;
  const filePath = path.join(baseDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "파일 없음" });
  }

  res.download(filePath);
});

export default router;
