import prisma from "../lib/prisma.js";
import { rejectListingSchema } from "../validation/listingValidation.js";

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

export const getPendingListings = async (req, res, next) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: "PENDING" },
      include: includeListingDetails,
      orderBy: { createdAt: "asc" },
    });

    return res.json({ listings });
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
      listing,
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
      listing,
    });
  } catch (error) {
    next(error);
  }
};
