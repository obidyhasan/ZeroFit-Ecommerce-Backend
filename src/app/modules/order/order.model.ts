import { model, Schema } from "mongoose";
import {
  IOrder,
  IOrderLog,
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from "./order.interface";

const statusLogSchema = new Schema<IOrderLog>(
  {
    status: { type: String, enum: Object.values(ORDER_STATUS), required: true },
    timestamp: { type: Date, default: Date.now() },
    updateBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, default: "" },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const orderSchema = new Schema<IOrder>(
  {
    trackingId: { type: String, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    carts: [{ type: Schema.Types.ObjectId, ref: "Cart", required: true }],
    payment: { type: Schema.Types.ObjectId, ref: "Payment" },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.Pending,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
    },
    totalAmount: { type: Number },
    statusLogs: [statusLogSchema],
    invoiceUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Order = model<IOrder>("Order", orderSchema);
