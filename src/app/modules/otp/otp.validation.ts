import z from "zod";

export const sendOTPZodSchema = z.object({
  name: z.string("Name require and must be string"),
  email: z
    .string("Email require and must be string")
    .email({ message: "Invalid email address format." }),
});

export const verifyOTPZodSchema = z.object({
  otp: z.string("OTP require and must be string"),
  email: z
    .string("Email require and must be string")
    .email({ message: "Invalid email address format." }),
});
