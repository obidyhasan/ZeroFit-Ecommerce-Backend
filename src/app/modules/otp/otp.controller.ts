/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { OTPService } from "./otp.service";
import { sendResponse } from "../../utils/sendResponse";

const sendOTP = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, name } = req.body;
    await OTPService.sendOTP(email, name);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "OTP sent successfully",
      data: null,
    });
  }
);

const verifyOTP = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body;
    await OTPService.verifyOTP(email, otp);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "OTP verified successfully",
      data: null,
    });
  }
);

export const OTPController = {
  sendOTP,
  verifyOTP,
};
