import prisma from "../lib/prisma.js";
import cloudinary from "../config/cloudinary.js";
import { createListingSchema, listingsQuerySchema } from "../validation/listingValidation.js";

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
      listing,
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
    const { category, city, minPrice, maxPrice } = parsed.data;

    const filters = {
      status: "APPROVED",
      ...(category ? { category } : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(minPrice || maxPrice
        ? {
            price: {
              ...(minPrice ? { gte: Number(minPrice) } : {}),
              ...(maxPrice ? { lte: Number(maxPrice) } : {}),
            },
          }
        : {}),
    };

    const listings = await prisma.listing.findMany({
      where: filters,
      include: listingInclude,
      orderBy: { createdAt: "desc" },
    });

    return res.json({ listings });
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

    return res.json({ listing });
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
    await Promise.allSettled(
      mediaWithPublicId.map((m) => cloudinary.uploader.destroy(m.publicId, { resource_type: m.type === "VIDEO" ? "video" : "image" }))
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

    return res.json({ listings });
  } catch (error) {
    next(error);
  }
};
