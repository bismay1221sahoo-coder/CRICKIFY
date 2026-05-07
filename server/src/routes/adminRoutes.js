import { Router } from "express";
import {
  bulkApproveListings,
  approveListing,
  getPendingListings,
  getListingReports,
  rejectListing,
} from "../controllers/adminController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/listings/pending", getPendingListings);
router.get("/reports", getListingReports);
router.patch("/listings/approve", bulkApproveListings);
router.patch("/listings/:id/approve", approveListing);
router.patch("/listings/:id/reject", rejectListing);

export default router;
