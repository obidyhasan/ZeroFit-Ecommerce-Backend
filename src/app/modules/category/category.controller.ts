/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ICategory, ISubCategory } from "./category.interface";
import { CategoryService } from "./category.service";

// const createCategory = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     sendResponse(res, {
//       success: true,
//       statusCode: httpStatus.OK,
//       message: "Create category successfully",
//       data: null,
//     });
//   }
// );

// --------------------- Category ------------------------
const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload: ICategory = {
      ...req.body,
      thumbnail: req.file?.path,
    };

    const category = await CategoryService.createCategory(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Create category successfully",
      data: category,
    });
  }
);

const getAllCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await CategoryService.getAllCategory();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Get All category successfully",
      data: {
        data: categories.data,
        meta: categories.meta,
      },
    });
  }
);

const getSingleCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const category = await CategoryService.getSingleCategory(req.params.slug);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Get category successfully",
      data: category,
    });
  }
);

const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload: ICategory = {
      ...req.body,
      thumbnail: req.file?.path,
    };

    const updateCategory = await CategoryService.updateCategory(
      req.params.id,
      payload
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Update category successfully",
      data: updateCategory,
    });
  }
);

const deleteCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await CategoryService.deleteCategory(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category delete successfully",
      data: null,
    });
  }
);

// --------------------- Sub Category ------------------------
const createSubCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload: ISubCategory = {
      ...req.body,
      thumbnail: req.file?.path,
    };

    const subCategory = await CategoryService.createSubCategory(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Create subCategory successfully",
      data: subCategory,
    });
  }
);

const getAllSubCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const subCategories = await CategoryService.getAllSubCategory();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Get All subCategory successfully",
      data: {
        data: subCategories.data,
        meta: subCategories.meta,
      },
    });
  }
);

const getSingleSubCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const subCategory = await CategoryService.getSingleSubCategory(
      req.params.slug
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Get subCategory successfully",
      data: subCategory,
    });
  }
);

const updateSubCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload: ISubCategory = {
      ...req.body,
      thumbnail: req.file?.path,
    };

    const updateSubCategory = await CategoryService.updateSubCategory(
      req.params.id,
      payload
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Update category successfully",
      data: updateSubCategory,
    });
  }
);

const deleteSubCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await CategoryService.deleteSubCategory(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "SubCategory delete successfully",
      data: null,
    });
  }
);

export const CategoryController = {
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
