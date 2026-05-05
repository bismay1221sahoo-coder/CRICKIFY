import { Router } from "express";
import {
  createListing,
  getApprovedListings,
  getListingById,
  getMyListings,
  deleteListing,
} from "../controllers/listingController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getApprovedListings);
router.get("/mine", requireAuth, getMyListings);
router.get("/:id", getListingById);
router.post("/", requireAuth, createListing);
router.delete("/:id", requireAuth, deleteListing);

export default router;
