import { z } from "zod";

const categories = ["BAT", "GLOVES", "PADS", "HELMET", "SHOES", "KIT", "OTHER"];
const conditions = ["LIKE_NEW", "GOOD", "FAIR", "NEEDS_REPAIR"];
const mediaTypes = ["IMAGE", "VIDEO"];
const sortOptions = ["newest", "price_low", "price_high"];

export const createListingSchema = z.object({
  title: z.string().trim().min(1).max(140),
  brand: z.string().trim().max(100).optional().nullable(),
  category: z.enum(categories),
  condition: z.enum(conditions),
  price: z.coerce.number().int().positive(),
  city: z.string().trim().min(1).max(80),
  usedDuration: z.string().trim().min(1).max(100),
  defects: z.string().trim().min(1).max(500),
  description: z.string().trim().min(1).max(5000),
  media: z
    .array(
      z.object({
        url: z.string().trim().url(),
        publicId: z.string().trim().min(1).nullable().optional(),
        type: z.enum(mediaTypes),
      })
    )
    .min(1),
});

  export const updateListingSchema = createListingSchema.omit({ media: true }).extend({
    batWeight: z.string().trim().min(1).max(50).optional(),
    willowType: z.string().trim().min(1).max(50).optional(),
    batSize: z.string().trim().min(1).max(50).optional(),
    handleType: z.string().trim().max(50).optional(),
    glovesType: z.string().trim().min(1).max(50).optional(),
    battingHand: z.string().trim().min(1).max(50).optional(),
    glovesSize: z.string().trim().min(1).max(50).optional(),
    padsType: z.string().trim().min(1).max(50).optional(),
    padsSize: z.string().trim().min(1).max(50).optional(),
    padsBattingHand: z.string().trim().min(1).max(50).optional(),
    helmetSize: z.string().trim().min(1).max(50).optional(),
    grillType: z.string().trim().min(1).max(50).optional(),
    shoesType: z.string().trim().min(1).max(50).optional(),
    nailsAvailable: z.string().trim().min(1).max(50).optional(),
    kitType: z.string().trim().min(1).max(50).optional(),
  });

export const listingsQuerySchema = z.object({
  category: z.enum(categories).optional(),
  city: z.string().trim().min(1).optional(),
  condition: z.enum(conditions).optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  sort: z.enum(sortOptions).optional(),
});

export const pendingListingsQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
});

export const rejectListingSchema = z.object({
  reason: z.string().trim().min(1).max(500),
});

export const reportListingSchema = z.object({
  reason: z.string().trim().min(10).max(500),
});

export const bulkApproveSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1).max(50),
});

export const listingIdParamSchema = z.object({
  id: z.string().trim().regex(/^c[a-z0-9]{8,}$/i),
});
