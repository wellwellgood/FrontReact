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
router.get("/upload", async (req, res) => {
  try {
    const [files] = await bucket.getFiles({ prefix: "files/" });
    const fileUrls = files.map((file) => ({
      name: file.name.replace("files/", ""),
      url: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
    }));
    res.json(fileUrls);
  } catch (err) {
    console.error("🔥 서버 에러:", err.message);
    res.status(500).json({ error: "🔥 목록 불러오기 실패" });
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
