import z from "zod";

export const loginUserZodSchema = z.object({
  email: z
    .string("Email require and must be string")
    .email({ message: "Invalid email address format." }),
  password: z.string("Password require and must be string"),
});

export const changePasswordUserZodSchema = z.object({
  oldPassword: z.string("Password require and must be string"),
  newPassword: z
    .string("New Password require and must be string")
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Z])/, {
      message: "New Password must contain at least 1 uppercase letter.",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "New Password must contain at least 1 special character.",
    })
    .regex(/^(?=.*\d)/, {
      message: "New Password must contain at least 1 number",
    }),
});

export const setPasswordUserZodSchema = z.object({
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
});

export const forgotPasswordUserZodSchema = z.object({
  email: z
    .string("Email require and must be string")
    .email({ message: "Invalid email address format." }),
});

export const resetPasswordUserZodSchema = z.object({
  id: z.string("Id require and must be string"),
  newPassword: z
    .string("NewPassword require and must be string")
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Z])/, {
      message: "NewPassword must contain at least 1 uppercase letter.",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "NewPassword must contain at least 1 special character.",
    })
    .regex(/^(?=.*\d)/, {
      message: "NewPassword must contain at least 1 number",
    }),
});
