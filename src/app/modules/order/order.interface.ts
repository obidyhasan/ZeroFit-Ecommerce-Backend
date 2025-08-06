import { Types } from "mongoose";

export enum PAYMENT_METHOD {
  SSL = "SSL",
  COD = "COD",
}

export enum ORDER_STATUS {
  Pending = "Pending",
  Picked = "Picked",
  InTransit = "InTransit",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
  Confirm = "Confirm",
}

export interface IOrderLog {
  status: ORDER_STATUS;
  timestamp: Date;
  updateBy: Types.ObjectId;
  note?: string;
}

export enum PAYMENT_STATUS {
  PAID = "PAID",
  UNPAID = "UNPAID",
  REFUNDED = "REFUNDED",
}

export interface IOrder {
  _id?: Types.ObjectId;
  trackingId: string;
  user: Types.ObjectId;
  carts: Types.ObjectId[];
  payment?: Types.ObjectId;
  paymentMethod?: PAYMENT_METHOD;
  paymentStatus: PAYMENT_STATUS;
  status: ORDER_STATUS;
  statusLogs?: IOrderLog[];
  totalAmount: number;
  invoiceUrl?: string;
  createdAt: Date;
}
