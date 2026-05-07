import { Router } from "express";
import {
  createListing,
  getApprovedListings,
  getListingById,
  getMyListings,
  deleteListing,
  reportListing,
} from "../controllers/listingController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getApprovedListings);
router.get("/mine", requireAuth, getMyListings);
router.get("/:id", getListingById);
router.post("/", requireAuth, createListing);
router.post("/:id/report", requireAuth, reportListing);
router.delete("/:id", requireAuth, deleteListing);

export default router;
