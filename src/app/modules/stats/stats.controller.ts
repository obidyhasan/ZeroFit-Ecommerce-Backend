import httpStatus from "http-status-codes";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { StatsService } from "./stats.service";
import { sendResponse } from "../../utils/sendResponse";

const getUserStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await StatsService.getUserStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User stats fetched successfully",
    data: stats,
  });
});

const getProductStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await StatsService.getProductStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product stats fetched successfully",
    data: stats,
  });
});

const getOrderStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await StatsService.getOrderStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order stats fetched successfully",
    data: stats,
  });
});

export const StatsController = {
  getUserStats,
  getProductStats,
  getOrderStats,
};
