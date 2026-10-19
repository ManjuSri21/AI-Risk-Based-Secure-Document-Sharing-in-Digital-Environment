import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import crypto from 'crypto';

const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const randomHex = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `upload-${Date.now()}-${randomHex}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.txt', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();

  // Explicitly reject executable or script extensions
  const blockedExtensions = ['.exe', '.sh', '.bat', '.cmd', '.vbs', '.js', '.msi', '.ps1', '.py', '.scr', '.dll', '.bin'];
  if (blockedExtensions.includes(ext)) {
    return cb(new Error(`Security Block: Files with extension '${ext}' are prohibited.`));
  }

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file format '${ext}'. Permitted types: PDF, TXT, DOC, DOCX, PNG, JPG, JPEG.`));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
  fileFilter,
});
