import { Router } from "express";
import { uploadListingMedia } from "../controllers/uploadController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { uploadListingMediaFile } from "../middleware/uploadMiddleware.js";

const router = Router();

router.post("/listing-media", requireAuth, uploadListingMediaFile.single("media"), uploadListingMedia);

export default router;
