import prisma from "../lib/prisma.js";
import cloudinary from "../config/cloudinary.js";
import {
  createListingSchema,
  listingsQuerySchema,
  reportListingSchema,
} from "../validation/listingValidation.js";

const listingInclude = {
  seller: {
    select: {
      id: true,
      name: true,
      phone: true,
      city: true,
    },
  },
  media: true,
};

const validCategories = ["BAT", "GLOVES", "PADS", "HELMET", "SHOES", "KIT", "OTHER"];
const validConditions = ["LIKE_NEW", "GOOD", "FAIR", "NEEDS_REPAIR"];
const validMediaTypes = ["IMAGE", "VIDEO"];

const normalizeMedia = (media = []) =>
  media
    .filter((item) => item?.url && validMediaTypes.includes(item?.type))
    .map((item) => ({
      url: item.url.trim(),
      publicId: item.publicId?.trim() || null,
      type: item.type,
    }));

const PROOF_MARKER_REGEX = /\[\[PROOF_PUBLIC_IDS:([^[\]]+)\]\]/;

const stripProofMarker = (description = "") =>
  description.replace(PROOF_MARKER_REGEX, "").trim();

const extractProofPublicIds = (description = "") => {
  const match = description.match(PROOF_MARKER_REGEX);
  if (!match?.[1]) return [];
  return match[1].split(",").map((id) => id.trim()).filter(Boolean);
};

const sanitizeListingForResponse = (listing) => ({
  ...listing,
  description: stripProofMarker(listing.description),
});

export const createListing = async (req, res, next) => {
  try {
    const parsed = createListingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid listing payload." });
    }
    const { title, brand, category, condition, price, city, usedDuration, defects, description, media } = parsed.data;

    const listing = await prisma.listing.create({
      data: {
        title,
        brand: brand || null,
        category,
        condition,
        price,
        city,
        usedDuration,
        defects,
        description,
        sellerId: req.user.id,
        media: { create: normalizeMedia(media) },
      },
      include: listingInclude,
    });

    return res.status(201).json({
      message: "Listing submitted for admin verification.",
      listing: sanitizeListingForResponse(listing),
    });
  } catch (error) {
    next(error);
  }
};

export const getApprovedListings = async (req, res, next) => {
  try {
    const parsed = listingsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid listing filters." });
    }
    const { category, city, condition, minPrice, maxPrice, sort } = parsed.data;

    const filters = {
      status: "APPROVED",
      ...(category ? { category } : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(condition ? { condition } : {}),
      ...(minPrice || maxPrice
        ? {
            price: {
              ...(minPrice ? { gte: Number(minPrice) } : {}),
              ...(maxPrice ? { lte: Number(maxPrice) } : {}),
            },
          }
        : {}),
    };

    const orderBy =
      sort === "price_low"
        ? { price: "asc" }
        : sort === "price_high"
          ? { price: "desc" }
          : { createdAt: "desc" };

    const listings = await prisma.listing.findMany({
      where: filters,
      include: listingInclude,
      orderBy,
    });

    return res.json({ listings: listings.map(sanitizeListingForResponse) });
  } catch (error) {
    next(error);
  }
};

export const getListingById = async (req, res, next) => {
  try {
    const listing = await prisma.listing.findFirst({
      where: {
        id: req.params.id,
        status: "APPROVED",
      },
      include: listingInclude,
    });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    return res.json({ listing: sanitizeListingForResponse(listing) });
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await prisma.listing.findFirst({
      where: { id: req.params.id, sellerId: req.user.id },
      include: { media: true },
    });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    await prisma.listing.delete({ where: { id: req.params.id } });

    const mediaWithPublicId = listing.media.filter((m) => m.publicId);
    const proofPublicIds = extractProofPublicIds(listing.description);
    const allPublicIds = [...mediaWithPublicId.map((m) => m.publicId), ...proofPublicIds];
    await Promise.allSettled(
      allPublicIds.map((publicId) => cloudinary.uploader.destroy(publicId, { resource_type: "auto" }))
    );

    return res.json({ message: "Listing deleted." });
  } catch (error) {
    next(error);
  }
};

export const getMyListings = async (req, res, next) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { sellerId: req.user.id },
      include: { media: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ listings: listings.map(sanitizeListingForResponse) });
  } catch (error) {
    next(error);
  }
};

export const reportListing = async (req, res, next) => {
  try {
    const parsed = reportListingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Report reason must be at least 10 characters." });
    }

    const listing = await prisma.listing.findFirst({
      where: { id: req.params.id, status: "APPROVED" },
      select: { id: true },
    });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    await prisma.listingReport.create({
      data: {
        listingId: listing.id,
        reporterId: req.user.id,
        reason: parsed.data.reason,
      },
    });

    return res.status(201).json({ message: "Report submitted. Thank you." });
  } catch (error) {
    next(error);
  }
};
