import { Types } from "mongoose";

export enum PSize {
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XLL = "XLL",
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
  subCategory?: Types.ObjectId;
  newPrice: number;
  oldPrice?: number;
  quantity: number;
  size: PSize[];
  property: PProperty[];
  description?: string;
  specification?: string[];
  images?: string[];
  deleteImages?: string[];
  createdAt?: Date;
}
