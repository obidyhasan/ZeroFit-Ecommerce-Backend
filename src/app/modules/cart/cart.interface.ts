import { Types } from "mongoose";
import { PSize } from "../product/product.interface";

export interface ICart {
  user: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
  size: PSize;
  amount: number;
  createdAt?: Date;
}
