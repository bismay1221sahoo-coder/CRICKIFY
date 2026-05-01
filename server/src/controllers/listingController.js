import prisma from "../lib/prisma.js";

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
    const {
      title,
      brand,
      category,
      condition,
      price,
      city,
      usedDuration,
      defects,
      description,
      media,
    } = req.body;

    if (!title || !category || !condition || !price || !city || !usedDuration || !defects || !description) {
      return res.status(400).json({
        message: "Title, category, condition, price, city, used duration, defects, and description are required.",
      });
    }

    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid equipment category." });
    }

    if (!validConditions.includes(condition)) {
      return res.status(400).json({ message: "Invalid equipment condition." });
    }

    if (!Array.isArray(media) || normalizeMedia(media).length === 0) {
      return res.status(400).json({ message: "At least one photo or video is required." });
    }

    const parsedPrice = Number(price);

    if (!Number.isInteger(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ message: "Price must be a positive whole number." });
    }

    const listing = await prisma.listing.create({
      data: {
        title: title.trim(),
        brand: brand?.trim() || null,
        category,
        condition,
        price: parsedPrice,
        city: city.trim(),
        usedDuration: usedDuration.trim(),
        defects: defects.trim(),
        description: description.trim(),
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
    const { category, city, minPrice, maxPrice } = req.query;

    if (category && !validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid equipment category." });
    }

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
