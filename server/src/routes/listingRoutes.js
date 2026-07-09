import { Router } from "express";
import {
  createListing,
  getApprovedListings,
  getListingById,
  getMyListings,
  getRelatedListings,
  getSavedListings,
  getSellerProfile,
  deleteListing,
  reportListing,
  saveListing,
  unsaveListing,
  updateListing,
} from "../controllers/listingController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { listingWriteRateLimiter, reportRateLimiter } from "../middleware/rateLimitMiddleware.js";

const router = Router();

router.get("/", getApprovedListings);
router.get("/mine", requireAuth, getMyListings);
router.get("/saved", requireAuth, getSavedListings);
router.get("/sellers/:sellerId", getSellerProfile);
router.get("/:id/related", getRelatedListings);
router.get("/:id", getListingById);
router.post("/", listingWriteRateLimiter, requireAuth, createListing);
router.post("/:id/save", listingWriteRateLimiter, requireAuth, saveListing);
router.post("/:id/report", reportRateLimiter, requireAuth, reportListing);
router.patch("/:id", listingWriteRateLimiter, requireAuth, updateListing);
router.delete("/:id/save", listingWriteRateLimiter, requireAuth, unsaveListing);
router.delete("/:id", listingWriteRateLimiter, requireAuth, deleteListing);

export default router;
