import multer from "multer";

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "video/webm"];

const storage = multer.memoryStorage();

export const uploadListingMediaFile = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedTypes.includes(file.mimetype)) {
      callback(new Error("Only JPG, PNG, WEBP, MP4, MOV, and WEBM files are allowed."));
      return;
    }

    callback(null, true);
  },
});
