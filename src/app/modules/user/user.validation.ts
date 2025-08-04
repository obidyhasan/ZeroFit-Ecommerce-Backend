import z from "zod";
import { Role, UserStatus } from "./user.interface";

export const createUserZodSchema = z.object({
  name: z
    .string("Name require and must be string")
    .min(2, "Name must be at least 2 characters long."),
  email: z
    .string("Email require and must be string")
    .email({ message: "Invalid email address format." }),
  password: z
    .string("Password require and must be string")
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character.",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least 1 number",
    }),
  phone: z
    .string("Phone number must be string")
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh, Format: +8801XXXXXXXXX",
    })
    .optional(),
  address: z.string("Address must be string").optional(),
  picture: z.string().optional(),
});

export const updateUserZodSchema = z.object({
  name: z
    .string("Name require and must be string")
    .min(2, "Name must be at least 2 characters long.")
    .optional(),
  role: z.enum(Object.values(Role) as [string]).optional(),
  status: z.enum(Object.values(UserStatus) as [string]).optional(),
  phone: z
    .string("Phone number must be string")
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh, Format: +8801XXXXXXXXX",
    })
    .optional(),
  address: z.string("Address must be string").optional(),
  picture: z.string().optional(),
  isDeleted: z.boolean("isDeleted must be boolean").optional(),
  isVerified: z.boolean("isVerified must be true or false").optional(),
});
