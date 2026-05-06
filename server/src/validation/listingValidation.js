import { z } from "zod";

const categories = ["BAT", "GLOVES", "PADS", "HELMET", "SHOES", "KIT", "OTHER"];
const conditions = ["LIKE_NEW", "GOOD", "FAIR", "NEEDS_REPAIR"];
const mediaTypes = ["IMAGE", "VIDEO"];

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

export const listingsQuerySchema = z.object({
  category: z.enum(categories).optional(),
  city: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
});

export const rejectListingSchema = z.object({
  reason: z.string().trim().min(1).max(500),
});
