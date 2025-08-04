import httpStatus from "http-status-codes";
import AppError from "../../errors/AppError";
import { ICategory, ISubCategory } from "./category.interface";
import { Category, SubCategory } from "./category.model";
import { deleteImageFromCloudinary } from "../../config/cloudinary.config";

// ---------------------- Category --------------------------
const createCategory = async (payload: Partial<ICategory>) => {
  const isCategory = await Category.findOne({ name: payload.name });
  if (isCategory)
    throw new AppError(httpStatus.BAD_REQUEST, "Category already exits!");

  const category = await Category.create(payload);
  return category;
};

const getAllCategory = async () => {
  const categories = await Category.find({}).populate("subCategories");
  const totalCategory = await Category.countDocuments();

  return {
    data: categories,
    meta: {
      total: totalCategory,
    },
  };
};

const getSingleCategory = async (slug: string) => {
  return await Category.findOne({ slug }).populate("subCategories");
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
  }).populate("subCategories");

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

// --------------------- Sub Category ---------------------

const createSubCategory = async (payload: Partial<ISubCategory>) => {
  const isSubCategory = await SubCategory.findOne({ name: payload.name });
  if (isSubCategory)
    throw new AppError(httpStatus.BAD_REQUEST, "SubCategory already exits!");

  const isCategoryExits = await Category.findById(payload.category);
  if (!isCategoryExits)
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");

  const subCategory = await SubCategory.create(payload);

  isCategoryExits.subCategories?.push(subCategory._id);
  await isCategoryExits.save();

  return subCategory;
};

const getAllSubCategory = async () => {
  const subCategory = await SubCategory.find({}).populate(
    "category",
    "name slug"
  );
  const totalSubCategory = await SubCategory.countDocuments();

  return {
    data: subCategory,
    meta: {
      total: totalSubCategory,
    },
  };
};

const getSingleSubCategory = async (slug: string) => {
  return await SubCategory.findOne({ slug }).populate("category", "name slug");
};

const updateSubCategory = async (
  id: string,
  payload: Partial<ISubCategory>
) => {
  const isSubCategoryExits = await SubCategory.findById(id);
  if (!isSubCategoryExits)
    throw new AppError(httpStatus.NOT_FOUND, "SubCategory not found!");

  const duplicatedSubCategory = await SubCategory.findOne({
    name: payload.name,
    _id: { $ne: id },
  });

  if (duplicatedSubCategory)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "A SubCategory with this name already exits"
    );

  const updateSubCategory = await SubCategory.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate("category", "name slug");

  if (payload.thumbnail && isSubCategoryExits.thumbnail) {
    await deleteImageFromCloudinary(isSubCategoryExits.thumbnail);
  }

  return updateSubCategory;
};

const deleteSubCategory = async (id: string) => {
  const isSubCategoryExits = await SubCategory.findById(id);
  if (!isSubCategoryExits)
    throw new AppError(httpStatus.NOT_FOUND, "SubCategory not found!");

  await SubCategory.findByIdAndDelete(id);
  if (isSubCategoryExits.thumbnail) {
    await deleteImageFromCloudinary(isSubCategoryExits.thumbnail);
  }

  return null;
};

export const CategoryService = {
  createCategory,
  getAllCategory,
  getSingleCategory,
  updateCategory,
  deleteCategory,
  createSubCategory,
  getAllSubCategory,
  getSingleSubCategory,
  updateSubCategory,
  deleteSubCategory,
};
