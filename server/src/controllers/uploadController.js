import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const resourceType = file.mimetype.startsWith("video/") ? "video" : "image";

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

    const media = await uploadToCloudinary(req.file);

    return res.status(201).json({
      message: "Media uploaded successfully.",
      media,
    });
  } catch (error) {
    next(error);
  }
};
