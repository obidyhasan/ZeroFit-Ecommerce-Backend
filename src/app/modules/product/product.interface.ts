import { Types } from "mongoose";

export enum PSize {
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XLL = "XLL",
}

export enum PStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  STOCK_OUT = "STOCK_OUT",
}

export enum PProperty {
  MegaDeal = "MegaDeal",
  NewArrival = "NewArrival",
  TopSelling = "TopSelling",
  Featured = "Featured",
  FreeDelivery = "FreeDelivery",
}

export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  category: Types.ObjectId;
  subCategory: Types.ObjectId;
  newPrice: number;
  oldPrice?: number;
  costPrice?: number;
  quantity: number;
  size: PSize[];
  property: PProperty[];
  isAvailable: boolean;
  status: PStatus;
  description?: string;
  specification?: string[];
  images?: string[];
  deleteImages?: string[];
  createdAt?: Date;
}
