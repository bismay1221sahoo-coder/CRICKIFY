import cloudinary from "../config/cloudinary.js";
import { fileTypeFromBuffer } from "file-type";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);
const MAX_PROOF_MEDIA_SIZE = 500 * 1024;

const uploadToCloudinary = (file, detectedMime) =>
  new Promise((resolve, reject) => {
    const resourceType = detectedMime.startsWith("video/") ? "video" : "image";

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "crickify/listings",
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          type: resourceType === "video" ? "VIDEO" : "IMAGE",
        });
      }
    );

    stream.end(file.buffer);
  });

export const uploadListingMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Media file is required." });
    }

    if (req.body?.purpose === "proof" && req.file.size > MAX_PROOF_MEDIA_SIZE) {
      return res.status(400).json({ message: "Invoice/proof file size must be 500KB or less." });
    }

    const detectedType = await fileTypeFromBuffer(req.file.buffer);
    if (!detectedType || !ALLOWED_MIME_TYPES.has(detectedType.mime)) {
      return res.status(400).json({ message: "Uploaded file content is not a supported media type." });
    }

    if (req.body?.purpose === "proof" && detectedType.mime.startsWith("video/")) {
      return res.status(400).json({ message: "Purchase proof must be an image file." });
    }

    const media = await uploadToCloudinary(req.file, detectedType.mime);

    return res.status(201).json({
      message: "Media uploaded successfully.",
      media,
    });
  } catch (error) {
    next(error);
  }
};
