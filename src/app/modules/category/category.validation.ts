import z from "zod";

// ---------------------- Sub Category ------------------------
export const createSubCategoryZodSchema = z.object({
  name: z
    .string("Name required and must be string")
    .min(1, { message: "Name must be at least 1 characters" }),
  thumbnail: z.string("Thumbnail must be string").optional(),
  description: z.string("Description must be string").optional(),
});

export const updateSubCategoryZodSchema = z.object({
  name: z
    .string("Name must be string")
    .min(1, { message: "Name must be at least 1 characters" })
    .optional(),
  thumbnail: z.string("Thumbnail must be string").optional(),
  description: z.string("Description must be string").optional(),
});

// ---------------------- Category ------------------------
export const createCategoryZodSchema = z.object({
  name: z
    .string("Name required and must be string")
    .min(1, { message: "Name must be at least 1 characters" }),
  subCategories: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"))
    .optional(),
  thumbnail: z.string("Thumbnail must be string").optional(),
  description: z.string("Description must be string").optional(),
});

export const updateCategoryZodSchema = z.object({
  name: z
    .string("Name must be string")
    .min(1, { message: "Name must be at least 1 characters" })
    .optional(),
  subCategories: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"))
    .optional(),
  thumbnail: z.string("Thumbnail must be string").optional(),
  description: z.string("Description must be string").optional(),
});
