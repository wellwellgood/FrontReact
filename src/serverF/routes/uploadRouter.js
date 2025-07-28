import { Router } from "express";
import multer from "multer";
import fs from "fs";
import { bucket } from "../firebase.js";

const router = Router();
const uploadDir = "./uploads";

// ✅ multer 설정 (임시 저장)
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

/* ✅ 파일 업로드 */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    console.log("🔥 업로드 요청 수신:", req.file);

    const localFile = req.file.path;
    const destFile = `files/${req.file.filename}`;

    // ✅ Firebase Storage에 업로드
    await bucket.upload(localFile, {
      destination: destFile,
      metadata: { contentType: req.file.mimetype }
    });

    // ✅ 로컬 임시 파일 삭제
    fs.unlinkSync(localFile);

    res.status(200).json({ success: true, message: "✅ 업로드 성공", file: destFile });
  } catch (err) {
    console.error("🔥 업로드 실패:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ✅ 파일 목록 조회 (앞 숫자 제거) */
router.get("/", async (req, res) => {
  try {
    const [files] = await bucket.getFiles({ prefix: "files/" });

    const fileList = files
      .filter(file => file.name !== "files/") // 빈 prefix 제외
      .map(file => {
        const originalName = file.name.replace("files/", "").replace(/^\d+-/, ""); 
        return {
          file_name: originalName,
          url: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
          uploadedAt: file.metadata.timeCreated,
          type: file.metadata.contentType?.startsWith("image") ? "images" : "other"
        };
      });

    // console.log("📂 Firebase 파일 목록:", fileList);
    res.status(200).json({ success: true, files: fileList });
  } catch (err) {
    console.error("🔥 파일 목록 불러오기 실패:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
