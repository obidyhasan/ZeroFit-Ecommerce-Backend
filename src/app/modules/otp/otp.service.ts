import httpStatus from "http-status-codes";
import crypto from "crypto";
import { User } from "../user/user.model";
import AppError from "../../errors/AppError";
import { redisClient } from "../../config/redis.config";
import { sendEmail } from "../../utils/sendEmail";

const OTP_EXPIRATION = 2 * 60; // 2 minute

const generateOTP = (length = 6) => {
  // 6 digit otp
  const otp = crypto.randomInt(10 ** (length - 1), 10 ** length); // 100000, 1000000
  return otp;
};

const sendOTP = async (email: string, name: string) => {
  const user = await User.findOne({ email });

  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  if (user.isVerified)
    throw new AppError(httpStatus.BAD_REQUEST, "You are already verified");

  const otp = generateOTP();
  const redisKey = `otp:${email}`;

  await redisClient.set(redisKey, otp, {
    expiration: {
      type: "EX",
      value: OTP_EXPIRATION,
    },
  });

  await sendEmail({
    to: email,
    subject: "Your OTP Code",
    templateName: "otp",
    templateData: {
      name: name,
      otp: otp,
    },
  });
};

const verifyOTP = async (email: string, otp: string) => {
  const user = await User.findOne({ email });

  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  if (user.isVerified)
    throw new AppError(httpStatus.BAD_REQUEST, "Your are already verified");

  const redisKey = `otp:${email}`;
  const savedOtp = await redisClient.get(redisKey);
  if (!savedOtp) throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP");

  if (savedOtp !== otp)
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP");

  await Promise.all([
    User.updateOne({ email }, { isVerified: true }, { runValidators: true }),
    redisClient.del([redisKey]),
  ]);
};

export const OTPService = {
  sendOTP,
  verifyOTP,
};
