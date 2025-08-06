import z from "zod";
import { ORDER_STATUS, PAYMENT_STATUS } from "./order.interface";

export const createOrderZodSchema = z.object({
  payment: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "PaymentId must be ObjectId")
    .optional(),
  carts: z.array(
    z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Cart ObjectId")
  ),
  paymentMethod: z
    .enum(Object.values(ORDER_STATUS) as [string], {
      message:
        "Invalid payment method provided. Please choose from 'SSL', 'COD'.",
    })
    .optional(),
  status: z
    .enum(Object.values(ORDER_STATUS) as [string], {
      message:
        "Invalid status provided. Please choose from 'Pending', 'Picked', 'InTransit', 'Delivered', 'Cancelled', 'Confirm'.",
    })
    .default(ORDER_STATUS.Pending),
});

export const updateOrderZodSchema = z.object({
  status: z.enum(Object.values(ORDER_STATUS) as [string], {
    message:
      "Invalid status provided. Please choose from 'Pending', 'Picked', 'InTransit', 'Delivered', 'Cancelled', 'Confirm'.",
  }),
  paymentStatus: z.enum(Object.values(PAYMENT_STATUS) as [string], {
    message:
      "Invalid payment status provided. Please choose from 'PAID', 'UNPAID', 'REFUNDED'.",
  }),
});
