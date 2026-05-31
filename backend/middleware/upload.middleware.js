import multer from 'multer';
import path from 'path';
import fs from 'fs';

// create uploads temp folder if it doesn't exist
const tempDir = './uploads/temp';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// store files temporarily on disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// filter allowed file types
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    const allowed = ['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/mkv', 'video/quicktime'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Use MP4, MOV, AVI, or WebM'), false);
    }
  } else if (file.fieldname === 'thumbnail' || file.fieldname === 'image' || file.fieldname === 'avatar' || file.fieldname === 'cover') {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Use JPG, PNG, or WebP'), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
});

// for lesson video upload
export const uploadVideo = upload.single('video');

// for course thumbnail
export const uploadThumbnail = upload.single('thumbnail');

// for profile avatar
export const uploadAvatar = upload.single('avatar');

// for multiple files
export const uploadCourseFiles = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

// middleware wrapper to handle multer errors properly
export const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 500MB',
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};