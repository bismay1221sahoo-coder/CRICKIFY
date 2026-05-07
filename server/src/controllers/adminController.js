import prisma from "../lib/prisma.js";
import {
  bulkApproveSchema,
  pendingListingsQuerySchema,
  rejectListingSchema,
} from "../validation/listingValidation.js";

const includeListingDetails = {
  seller: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
    },
  },
  media: true,
};

const PROOF_MARKER_REGEX = /\[\[PROOF_PUBLIC_IDS:([^[\]]+)\]\]/;
const stripProofMarker = (description = "") =>
  description.replace(PROOF_MARKER_REGEX, "").trim();
const sanitizeListingForResponse = (listing) => ({
  ...listing,
  description: stripProofMarker(listing.description),
});

export const getPendingListings = async (req, res, next) => {
  try {
    const parsed = pendingListingsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid search query." });
    }
    const search = parsed.data.search;

    const searchFilter = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { brand: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
            { seller: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {};

    const listings = await prisma.listing.findMany({
      where: { status: "PENDING", ...searchFilter },
      include: includeListingDetails,
      orderBy: { createdAt: "asc" },
    });

    return res.json({ listings: listings.map(sanitizeListingForResponse) });
  } catch (error) {
    next(error);
  }
};

export const bulkApproveListings = async (req, res, next) => {
  try {
    const parsed = bulkApproveSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid listing selection." });
    }

    const { ids } = parsed.data;
    const result = await prisma.listing.updateMany({
      where: { id: { in: ids }, status: "PENDING" },
      data: { status: "APPROVED", rejectReason: null },
    });

    return res.json({ message: "Listings approved.", approvedCount: result.count });
  } catch (error) {
    next(error);
  }
};

export const approveListing = async (req, res, next) => {
  try {
    const existing = await prisma.listing.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    const listing = await prisma.listing.update({
      where: { id: req.params.id },
      data: {
        status: "APPROVED",
        rejectReason: null,
      },
      include: includeListingDetails,
    });

    return res.json({
      message: "Listing approved successfully.",
      listing: sanitizeListingForResponse(listing),
    });
  } catch (error) {
    next(error);
  }
};

export const rejectListing = async (req, res, next) => {
  try {
    const parsed = rejectListingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Reject reason is required." });
    }
    const { reason } = parsed.data;

    const existing = await prisma.listing.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    const listing = await prisma.listing.update({
      where: { id: req.params.id },
      data: {
        status: "REJECTED",
        rejectReason: reason.trim(),
      },
      include: includeListingDetails,
    });

    return res.json({
      message: "Listing rejected.",
      listing: sanitizeListingForResponse(listing),
    });
  } catch (error) {
    next(error);
  }
};
