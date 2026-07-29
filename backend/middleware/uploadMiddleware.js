const path = require('path');
const fs = require('fs');
const multer = require('multer');

const root = path.join(__dirname, '..');
const uploadRoot = path.join(root, 'uploads');
const photoIdDir = path.join(uploadRoot, 'photo-ids');
const lostItemDir = path.join(uploadRoot, 'lost-items');

for (const dir of [uploadRoot, photoIdDir, lostItemDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function storageFor(folder) {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, folder === 'photo-id' ? photoIdDir : lostItemDir);
    },
    filename: function (req, file, cb) {
      const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeOriginal}`);
    }
  });
}

function fileFilter(req, file, cb) {
  const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error('Only JPG, PNG, and PDF files are allowed'));
  }
  cb(null, true);
}

const limits = { fileSize: 5 * 1024 * 1024 };

const uploadPhotoId = multer({ storage: storageFor('photo-id'), fileFilter, limits });
const uploadLostItemPhoto = multer({ storage: storageFor('lost-item'), fileFilter, limits });

function toPublicUploadPath(file) {
  if (!file) return null;
  const normalized = file.path.replace(/\\/g, '/');
  const idx = normalized.indexOf('/uploads/');
  return idx >= 0 ? normalized.slice(idx) : `/uploads/${file.filename}`;
}

module.exports = { uploadPhotoId, uploadLostItemPhoto, toPublicUploadPath };
