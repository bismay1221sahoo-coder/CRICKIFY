import { z } from "zod";

const categories = ["BAT", "GLOVES", "PADS", "HELMET", "SHOES", "KIT", "OTHER"];
const conditions = ["LIKE_NEW", "GOOD", "FAIR", "NEEDS_REPAIR"];
const mediaTypes = ["IMAGE", "VIDEO"];
const sortOptions = ["newest", "price_low", "price_high"];

export const createListingSchema = z.object({
  title: z.string().trim().min(1),
  brand: z.string().trim().max(100).optional().nullable(),
  category: z.enum(categories),
  condition: z.enum(conditions),
  price: z.coerce.number().int().positive(),
  city: z.string().trim().min(1),
  usedDuration: z.string().trim().min(1),
  defects: z.string().trim().min(1),
  description: z.string().trim().min(1),
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

  export const updateListingSchema = createListingSchema.omit({ media: true });

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
