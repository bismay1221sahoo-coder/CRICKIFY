import prisma from "../lib/prisma.js";
import cloudinary from "../config/cloudinary.js";
import {
  createListingSchema,
  listingsQuerySchema,
  reportListingSchema,
  updateListingSchema,
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

const EXTRA_FIELD_LABELS = {
  batWeight: "Bat Weight (approx)",
  willowType: "Willow Type",
  batSize: "Bat Size",
  handleType: "Handle Type",
  glovesType: "Gloves Type",
  battingHand: "Batting Hand",
  glovesSize: "Gloves Size",
  padsType: "Pads Type",
  padsSize: "Pads Size",
  padsBattingHand: "Batting Hand",
  helmetSize: "Helmet Size",
  grillType: "Grill Type",
  shoesType: "Shoes Type",
  nailsAvailable: "Nails Available",
  kitType: "Kit Type",
};

const CATEGORY_EXTRA_LINE_ORDER = {
  BAT: ["batWeight", "willowType", "batSize", "handleType"],
  GLOVES: ["glovesType", "battingHand", "glovesSize"],
  PADS: ["padsType", "padsSize", "padsBattingHand"],
  HELMET: ["helmetSize", "grillType"],
  SHOES: ["shoesType", "nailsAvailable"],
  KIT: ["kitType"],
};

const normalizeMedia = (media = []) =>
  media
    .filter((item) => item?.url && validMediaTypes.includes(item?.type))
    .map((item) => ({
      url: item.url.trim(),
      publicId: item.publicId?.trim() || null,
      type: item.type,
    }));

const PROOF_MARKER_REGEX = /\[\[PROOF_PUBLIC_IDS:([^[\]]+)\]\]/;
const PROOF_LINE_REGEX = /^Purchase Proof:\s*(.+)$/im;
const PROOF_REASON_LINE_REGEX = /^Purchase Proof Reason:\s*(.+)$/im;

const stripProofMarker = (description = "") =>
  description.replace(PROOF_MARKER_REGEX, "").trim();

const extractProofPublicIds = (description = "") => {
  const match = description.match(PROOF_MARKER_REGEX);
  if (!match?.[1]) return [];
  return match[1].split(",").map((id) => id.trim()).filter(Boolean);
};

const splitMetaBlock = (description = "") => {
  const withoutMarker = description.replace(PROOF_MARKER_REGEX, "").trim();
  const [metaBlock = "", ...rest] = withoutMarker.split("\n\n");
  return { metaBlock, userDescription: rest.join("\n\n").trim(), proofMarker: description.match(PROOF_MARKER_REGEX)?.[0] || "" };
};

const parseMetaParts = (metaBlock = "") =>
  metaBlock
    .split(/\s*\|\s*|\n/)
    .map((part) => part.trim())
    .filter(Boolean);

const getActiveExtraFieldOrder = (category, details = {}) => {
  const baseOrder = CATEGORY_EXTRA_LINE_ORDER[category] || Object.keys(details || {});
  const normalizedGlovesType = String(details?.glovesType || "").trim().toLowerCase();
  const normalizedPadsType = String(details?.padsType || "").trim().toLowerCase();
  const normalizedShoesType = String(details?.shoesType || "").trim().toLowerCase();

  if (category === "GLOVES") {
    return baseOrder.filter(
      (fieldName) =>
        fieldName === "glovesType" ||
        (normalizedGlovesType === "batting gloves" && (fieldName === "battingHand" || fieldName === "glovesSize"))
    );
  }

  if (category === "PADS") {
    return baseOrder.filter(
      (fieldName) =>
        fieldName === "padsType" ||
        (normalizedPadsType === "batting pads" && (fieldName === "padsSize" || fieldName === "padsBattingHand"))
    );
  }

  if (category === "SHOES") {
    return baseOrder.filter(
      (fieldName) =>
        fieldName === "shoesType" ||
        (normalizedShoesType === "spikes" && fieldName === "nailsAvailable")
    );
  }

  return baseOrder;
};

const buildExtraMetaParts = (category, data = {}) =>
  getActiveExtraFieldOrder(category, data)
    .map((fieldName) => {
      const value = data[fieldName];
      if (value === undefined || value === null || String(value).trim() === "") {
        return null;
      }
      const label = EXTRA_FIELD_LABELS[fieldName] || fieldName;
      return `${label}: ${value}`;
    })
    .filter(Boolean);

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

export const updateListing = async (req, res, next) => {
  try {
    const parsed = updateListingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid listing payload." });
    }

    const listing = await prisma.listing.findFirst({
      where: { id: req.params.id, sellerId: req.user.id, status: "PENDING" },
    });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found or already approved." });
    }

    const existingDescription = listing.description || "";
    const { metaBlock, proofMarker } = splitMetaBlock(existingDescription);
    const metaParts = parseMetaParts(metaBlock);
    const proofParts = metaParts.filter(
      (part) => part.toLowerCase().startsWith("purchase proof")
    );
    const filteredParts = buildExtraMetaParts(parsed.data.category, parsed.data);

    const rebuiltMeta = [
      filteredParts.join(" | "),
      proofParts.length ? proofParts.join(" | ") : "",
    ]
      .filter(Boolean)
      .join("\n");

    const nextDescription = rebuiltMeta
      ? `${rebuiltMeta}\n\n${parsed.data.description}${proofMarker ? `\n\n${proofMarker}` : ""}`
      : `${parsed.data.description}${proofMarker ? `\n\n${proofMarker}` : ""}`;

    const updated = await prisma.listing.update({
      where: { id: listing.id },
      data: {
        title: parsed.data.title,
        brand: parsed.data.brand || null,
        category: parsed.data.category,
        condition: parsed.data.condition,
        price: parsed.data.price,
        city: parsed.data.city,
        usedDuration: parsed.data.usedDuration,
        defects: parsed.data.defects,
        description: nextDescription,
      },
      include: listingInclude,
    });

    return res.json({
      message: "Listing updated.",
      listing: sanitizeListingForResponse(updated),
    });
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
