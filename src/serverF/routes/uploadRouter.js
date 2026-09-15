import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";

const router = Router();
const root = path.resolve(process.env.FILE_STORAGE_DIR || fileURLToPath(new URL("../storage/files/", import.meta.url)));
const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const storage = multer.diskStorage({
  destination(req, file, cb) { fs.mkdir(root, { recursive: true }).then(() => cb(null, root), cb); },
  filename(req, file, cb) { cb(null, randomUUID()); },
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024, files: 1 } });
const urlFor = (req, id) => `${(process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "")}/api/upload/files/${id}`;
const present = (req, meta) => ({ ...meta, url: urlFor(req, meta.id) });

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: "파일을 선택하세요." });
  const file = req.file;
  const meta = { id: file.filename, file_name: path.basename(file.originalname.replaceAll("\\", "/")), uploadedAt: new Date().toISOString(), type: file.mimetype.startsWith("image/") ? "images" : "other", mime: file.mimetype, size: file.size };
  try {
    await fs.writeFile(path.join(root, `${meta.id}.json`), JSON.stringify(meta), { flag: "wx" });
    res.json({ success: true, message: "업로드 성공", file: meta.id, ...present(req, meta) });
  } catch {
    await fs.unlink(file.path).catch(() => {});
    res.status(500).json({ success: false, error: "파일 저장 실패" });
  }
});
router.get("/", async (req, res) => {
  try {
    await fs.mkdir(root, { recursive: true });
    const names = await fs.readdir(root);
    const files = [];
    for (const name of names.filter(n => n.endsWith(".json") && idPattern.test(n.slice(0, -5)))) {
      try {
        const meta = JSON.parse(await fs.readFile(path.join(root, name), "utf8"));
        if (!idPattern.test(meta.id) || name !== `${meta.id}.json`) continue;
        await fs.access(path.join(root, meta.id));
        files.push(present(req, meta));
      } catch { /* 불완전한 항목은 제외 */ }
    }
    files.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
    res.json({ success: true, files });
  } catch { res.status(500).json({ success: false, error: "파일 목록 조회 실패" }); }
});
router.get("/files/:id", async (req, res) => {
  const { id } = req.params;
  if (!idPattern.test(id)) return res.sendStatus(404);
  try {
    const meta = JSON.parse(await fs.readFile(path.join(root, `${id}.json`), "utf8"));
    res.setHeader("X-Content-Type-Options", "nosniff");
    const preview = ["image/png", "image/jpeg", "image/gif", "image/webp"].includes(meta.mime);
    if (req.query.download === "1" || !preview) {
      res.download(path.join(root, id), meta.file_name, err => { if (err && !res.headersSent) res.sendStatus(404); });
    } else {
      res.type(meta.mime).sendFile(path.join(root, id), err => { if (err && !res.headersSent) res.sendStatus(404); });
    }
  } catch { res.sendStatus(404); }
});
router.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ success: false, error: err.code === "LIMIT_FILE_SIZE" ? "파일은 25MB까지 업로드할 수 있습니다." : "업로드 요청을 처리할 수 없습니다." });
});
export default router;
