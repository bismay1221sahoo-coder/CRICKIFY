import { Router } from "express";
import {
  approveListing,
  getPendingListings,
  rejectListing,
} from "../controllers/adminController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/listings/pending", getPendingListings);
router.patch("/listings/:id/approve", approveListing);
router.patch("/listings/:id/reject", rejectListing);

export default router;
