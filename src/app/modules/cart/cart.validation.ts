import z from "zod";
import { PSize } from "../product/product.interface";

export const createCartZodSchema = z.object({
  product: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "ProductId required and must be ObjectId"),
  quantity: z
    .number("Quantity required and must be number.")
    .nonnegative("Quantity can't be negative number")
    .default(1),
  size: z.enum(Object.values(PSize) as [string], {
    message:
      "Invalid size provided. Please choose from 'S', 'M', 'L', 'XL', 'XLL'.",
  }),
});

export const updateCartZodSchema = z.object({
  quantity: z.number("Quantity required and must be number.").optional(),
  size: z
    .enum(Object.values(PSize) as [string], {
      message:
        "Invalid size provided. Please choose from 'S', 'M', 'L', 'XL', 'XLL'.",
    })
    .optional(),
});
