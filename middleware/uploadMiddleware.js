import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    let folder = "uploads/others";

    if (file.mimetype.startsWith("image/")) {
      folder = "uploads/images";
    } else if (file.mimetype.startsWith("video/")) {
      folder = "uploads/videos";
    } else if (file.mimetype === "application/pdf") {
      folder = "uploads/pdfs";
    }

    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",

    // videos
    "video/mp4",
    "video/webm",
    "video/quicktime",

    // pdf
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    req.fileValidationError = "Only images, videos, and PDFs are allowed";
    cb(null, false); // ❗ VERY IMPORTANT
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

export default upload;
