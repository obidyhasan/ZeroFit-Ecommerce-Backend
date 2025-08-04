import httpStatus from "http-status-codes";
import AppError from "../../errors/AppError";
import { ICategory } from "./category.interface";
import { Category } from "./category.model";
import { deleteImageFromCloudinary } from "../../config/cloudinary.config";

const createCategory = async (payload: Partial<ICategory>) => {
  const isCategory = await Category.findOne({ name: payload.name });
  if (isCategory)
    throw new AppError(httpStatus.BAD_REQUEST, "Category already exits!");

  const category = Category.create(payload);
  return category;
};

const getAllCategory = async () => {
  const categories = await Category.find({});
  const totalCategory = await Category.countDocuments();

  return {
    data: categories,
    meta: {
      total: totalCategory,
    },
  };
};

const getSingleCategory = async (slug: string) => {
  return await Category.findOne({ slug });
};

const updateCategory = async (id: string, payload: Partial<ICategory>) => {
  const isCategoryExits = await Category.findById(id);
  if (!isCategoryExits)
    throw new AppError(httpStatus.NOT_FOUND, "Category not found!");

  const duplicatedCategory = await Category.findOne({
    name: payload.name,
    _id: { $ne: id },
  });

  if (duplicatedCategory)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "A Category with this name already exits"
    );

  const updateCategory = await Category.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (payload.thumbnail && isCategoryExits.thumbnail) {
    await deleteImageFromCloudinary(isCategoryExits.thumbnail);
  }

  return updateCategory;
};

const deleteCategory = async (id: string) => {
  const isCategoryExits = await Category.findById(id);
  if (!isCategoryExits)
    throw new AppError(httpStatus.NOT_FOUND, "Category not found!");

  await Category.findByIdAndDelete(id);
  if (isCategoryExits.thumbnail) {
    await deleteImageFromCloudinary(isCategoryExits.thumbnail);
  }

  return null;
};

export const CategoryService = {
  createCategory,
  getAllCategory,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
