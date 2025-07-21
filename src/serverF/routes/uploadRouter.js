// routes/uploadRouter.js (ESM 버전)
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");
const imagesDir = path.join(uploadDir, "images");
const docsDir = path.join(uploadDir, "docs");

[uploadDir, imagesDir, docsDir].forEach(dir => {
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
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// ✅ 파일 업로드
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "파일이 업로드되지 않았습니다." });
  }
  res.status(200).json({ success: true, fileName: req.file.filename });
});

// ✅ 파일 목록 불러오기
router.get("/", (req, res) => {
  try {
    const imageFiles = fs.readdirSync(imagesDir).map(file => {
      const fullPath = path.join(imagesDir, file);
      const stat = fs.statSync(fullPath);
      return {
        type: "images",
        name: file,
        file_name: (() => {
          const idx = file.indexOf("-");
          return idx !== -1 ? file.slice(idx + 1) : file;
        })(),
        uploadedAt: stat.birthtime // ✅ 추가
      };
    });
    
    const docFiles = fs.readdirSync(docsDir).map(file => {
      const fullPath = path.join(docsDir, file);
      const stat = fs.statSync(fullPath);
      return {
        type: "docs",
        name: file,
        file_name: file.split(/-(.+)/)[1] || file,
        uploadedAt: stat.birthtime // ✅ 추가
      };
    });
    
    const rootFiles = fs.readdirSync(uploadDir)
      .filter(file => file !== "images" && file !== "docs")
      .map(file => {
        const fullPath = path.join(uploadDir, file);
        const stat = fs.statSync(fullPath);
        return {
          type: "others",
          name: file,
          file_name: file.split(/-(.+)/)[1] || file,
          uploadedAt: stat.birthtime // ✅ 추가
        };
      });

    const allFiles = [...imageFiles, ...docFiles, ...rootFiles];
    res.status(200).json({ success: true, files: allFiles });
  } catch (error) {
    console.error("❌ 파일 목록 불러오기 오류:", error);
    res.status(500).json({ success: false, message: "파일 목록을 불러오는 중 오류 발생" });
  }
});

// ✅ 파일 다운로드
router.get("/download/:type/:filename", (req, res) => {
  const { type, filename } = req.params;
  const baseDir = type === "images" ? imagesDir : docsDir;
  const filePath = path.join(baseDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "파일 없음" });
  }

  res.download(filePath);
});

export default router;
