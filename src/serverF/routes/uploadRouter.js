// uploadRouter.js
import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { storage } from "../../firebase.js";
import { ref, uploadBytes, getDownloadURL, listAll, getMetadata } from "firebase/storage";

const router = Router();
const uploadDir = "./uploads";

// 로컬 저장 (Firebase로 업로드 전에 저장)
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

// ✅ 파일 업로드
router.post("/", upload.single("file"), async (req, res) => {

  if (!req.file) {
    return res.status(400).json({ error: "파일이 없습니다" });
  }

  try {
    const file = req.file;
    const storageRef = ref(storage, `files/${file.filename}`);
    const buffer = fs.readFileSync(file.path);

    console.log("🔥 업로드 요청 파일:", req.file);

    await uploadBytes(storageRef, buffer, { contentType: file.mimetype });
    fs.unlinkSync(file.path); // 로컬 파일 삭제

    const url = await getDownloadURL(storageRef);
    const metadata = await getMetadata(storageRef);

    res.json({
      success: true,
      message: "업로드 완료",
      fileUrl: url,
      metadata
    });
  } catch (err) {
    console.error("❌ 업로드 실패:", err);
    res.status(500).json({ success: false, error: "파일 업로드 실패" });
  }
});

// ✅ 파일 목록 조회
router.get("/", async (req, res) => {
  try {
    const listRef = ref(storage, "files");
    const result = await listAll(listRef);

    const fileList = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          file_name: itemRef.name,
          url,
          uploadedAt: new Date().toISOString(),
        };
      })
    );

    res.status(200).json({ files: fileList });
  } catch (err) {
    console.error("🔥 파일 목록 불러오기 실패:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
