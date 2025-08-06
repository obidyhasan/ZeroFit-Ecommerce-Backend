import httpStatus from "http-status-codes";
import AppError from "../../errors/AppError";
import { IProduct, PStatus } from "./product.interface";
import { Product } from "./product.model";
import { deleteImageFromCloudinary } from "../../config/cloudinary.config";

const createProduct = async (payload: Partial<IProduct>) => {
  const isProductExits = await Product.findOne({ name: payload.name });
  if (isProductExits)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Product with this name already exits!"
    );

  const product = await Product.create(payload);
  return product;
};

const getAllProduct = async () => {
  const products = await Product.find({ status: PStatus.ACTIVE })
    .populate("category", "name slug")
    .populate("subCategory", "name slug");
  const totalProduct = await Product.countDocuments();

  return {
    data: products,
    meta: {
      total: totalProduct,
    },
  };
};

const getSingleProduct = async (slug: string) => {
  const product = await Product.findOne({ slug })
    .populate("category", "name slug")
    .populate("subCategory", "name slug");

  if (!product) throw new AppError(httpStatus.NOT_FOUND, "Product not found!");

  if (product.status === PStatus.INACTIVE)
    throw new AppError(httpStatus.NOT_FOUND, "Product is InActive!");

  return {
    product,
  };
};

const updateProduct = async (id: string, payload: Partial<IProduct>) => {
  const isProductExits = await Product.findById(id);
  if (!isProductExits)
    throw new AppError(httpStatus.NOT_FOUND, "Product not found!");

  // Only Add More Images
  if (
    payload.images &&
    payload.images.length &&
    isProductExits.images &&
    isProductExits.images.length
  ) {
    payload.images = [...payload.images, ...isProductExits.images];
  }

  // Add More Images & Delete Old Image
  if (
    payload.deleteImages &&
    payload.deleteImages.length &&
    isProductExits.images &&
    isProductExits.images.length
  ) {
    // Not Delete
    const restDBImage = isProductExits.images.filter(
      (imageUrl) => !payload.deleteImages?.includes(imageUrl)
    );

    const updatedPayloadImages = (payload.images || [])
      .filter((imageUrl) => !payload.deleteImages?.includes(imageUrl))
      .filter((imageUrl) => !restDBImage.includes(imageUrl));

    payload.images = [...restDBImage, ...updatedPayloadImages];
  }

  if (payload.images?.length === 0) {
    payload.images = isProductExits.images;
  }

  const updateProduct = await Product.findByIdAndUpdate(id, payload, {
    new: true,
  });

  if (
    payload.deleteImages &&
    payload.deleteImages.length &&
    isProductExits.images &&
    isProductExits.images.length
  ) {
    await Promise.all(
      payload.deleteImages.map((url) => deleteImageFromCloudinary(url))
    );
  }

  return updateProduct;
};

const deleteProduct = async (id: string) => {
  const isProductExits = await Product.findById(id);
  if (!isProductExits)
    throw new AppError(httpStatus.NOT_FOUND, "Product not found!");

  await Product.findByIdAndDelete(id);
  if (isProductExits.images && isProductExits.images.length) {
    await Promise.all(
      isProductExits.images.map((url) => deleteImageFromCloudinary(url))
    );
  }

  return null;
};

export const ProductService = {
  createProduct,
  getAllProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
