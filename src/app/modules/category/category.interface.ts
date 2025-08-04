import { Types } from "mongoose";

export interface ISubCategory {
  _id?: Types.ObjectId;
  name: string;
  slug: string;
  thumbnail?: string;
  description?: string;
}

export interface ICategory {
  _id?: Types.ObjectId;
  name: string;
  slug: string;
  subCategories?: Types.ObjectId[];
  thumbnail?: string;
  description?: string;
}
