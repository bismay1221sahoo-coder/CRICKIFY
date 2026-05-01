import { Router } from "express";
import {
  createListing,
  getApprovedListings,
  getListingById,
  getMyListings,
} from "../controllers/listingController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getApprovedListings);
router.get("/mine", requireAuth, getMyListings);
router.get("/:id", getListingById);
router.post("/", requireAuth, createListing);

export default router;
