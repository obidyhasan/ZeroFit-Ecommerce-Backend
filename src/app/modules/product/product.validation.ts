import z, { array } from "zod";
import { PProperty, PSize, PStatus } from "./product.interface";

export const createProductZodSchema = z.object({
  name: z
    .string("Name required and must be string")
    .min(1, { message: "Name must be at least 1 characters" }),
  category: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Category required and must be ObjectId"),
  subCategory: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "SubCategory required and must be ObjectId"),

  newPrice: z.number("NewPrice required and must be number"),
  oldPrice: z.number("OldPrice must be number").optional(),
  costPrice: z.number("CostPrice must be number").optional(),
  quantity: z
    .number("Quantity required and must be number")
    .min(1, { message: "Quantity must be at less then 1." }),
  size: array(
    z.enum(Object.values(PSize) as [string], {
      message:
        "Invalid size provided. Please choose from 'S', 'M', 'L', 'XL', 'XLL'.",
    })
  ).optional(),
  property: array(
    z.enum(Object.values(PProperty) as [string], {
      message:
        "Invalid size provided. Please choose from 'MegaDeal', 'NewArrival', 'TopSelling', 'Featured', 'FreeDelivery'.",
    })
  ).optional(),
  isAvailable: z.boolean("IsAvailable must be true or false").optional(),
  status: z
    .enum(Object.values(PStatus) as [string], {
      message:
        "Invalid status provided. Please choose from 'ACTIVE', 'INACTIVE', 'STOCK_OUT'.",
    })
    .optional(),
  description: z.string("Description must be string").optional(),
  specification: array(z.string("Description must be string")).optional(),
});

export const updateProductZodSchema = z.object({
  name: z
    .string("Name must be string")
    .min(1, { message: "Name must be at least 1 characters" })
    .optional(),
  category: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Category must be ObjectId")
    .optional(),
  subCategory: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "SubCategory must be ObjectId")
    .optional(),
  images: z.array(z.string()).optional(),
  newPrice: z.number("NewPrice must be number").optional(),
  oldPrice: z.number("OldPrice must be number").optional(),
  costPrice: z.number("CostPrice must be number").optional(),
  quantity: z.number("Quantity must be number").optional(),
  size: array(z.enum(Object.values(PSize) as [string])).optional(),
  property: array(z.enum(Object.values(PProperty) as [string])).optional(),
  isAvailable: z.boolean("IsAvailable must be true or false").optional(),
  status: z
    .enum(Object.values(PStatus) as [string], {
      message:
        "Invalid status provided. Please choose from 'ACTIVE', 'INACTIVE', 'STOCK_OUT'.",
    })
    .optional(),
  description: z.string("Description must be string").optional(),
  specification: array(z.string("Description must be string")).optional(),
  deleteImages: z.array(z.string()).optional(),
});
