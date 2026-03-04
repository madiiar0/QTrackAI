import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOAD_FILE_PATH = path.resolve(__dirname, "..", "uploads");

fs.mkdir(UPLOAD_FILE_PATH, {recursive: true}, (err) => {
    if (err) console.error("Failed to ensure upload directory:", err);
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_FILE_PATH),
    filename: (req, file, cb) => {
        const safeExt = ".pdf";
        const unique = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
        cb(null, `${unique}${safeExt}`);
    }
});

function fileFilter(req, file, cb) {
    const isPdfMime = file.mimetype === "application/pdf";
    const ext = path.extname(file.originalname || "").toLowerCase();
    const isPdfExt = ext === ".pdf";

    if (!isPdfMime || !isPdfExt) {
        return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
}

export const uploadFile = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB
    }
});
