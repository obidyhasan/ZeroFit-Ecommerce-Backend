import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { createNewAccessTokenWithRefreshToken } from "../../utils/userTokens";
import { User } from "../user/user.model";
import AppError from "../../errors/AppError";
import { envVars } from "../../config/env";
import { IAuthProvider, UserStatus } from "../user/user.interface";
import { generateToken } from "../../utils/jwt";
import { sendEmail } from "../../utils/sendEmail";

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken = await createNewAccessTokenWithRefreshToken(
    refreshToken
  );
  return {
    accessToken: newAccessToken,
  };
};

const changePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.userId);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User dose not exist!");

  const isOldPassword = await bcryptjs.compare(
    oldPassword,
    user?.password as string
  );

  if (!isOldPassword)
    throw new AppError(httpStatus.UNAUTHORIZED, "Old password does not match");

  const isNewPassword = await bcryptjs.compare(
    newPassword,
    user?.password as string
  );

  if (isNewPassword)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This new password same to old password. Try another password!"
    );

  user.password = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );
  await user.save();
};

const setPassword = async (userId: string, password: string) => {
  const isUserExist = await User.findById(userId);
  if (!isUserExist) throw new AppError(httpStatus.NOT_FOUND, "User not found!");

  if (
    isUserExist.password &&
    isUserExist.auths.some(
      (providerObj) =>
        providerObj.provider === "google" ||
        providerObj.provider === "credentials"
    )
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have already set you password. Now you can change the password from your profile password update "
    );
  }

  const hashedPassword = await bcryptjs.hash(
    password,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const credentialProvider: IAuthProvider = {
    provider: "credentials",
    providerId: isUserExist.email,
  };

  const auths: IAuthProvider[] = [...isUserExist.auths, credentialProvider];

  isUserExist.password = hashedPassword;
  isUserExist.auths = auths;

  await isUserExist.save();
};

const forgotPassword = async (email: string) => {
  const isUserExist = await User.findOne({ email });
  if (!isUserExist)
    throw new AppError(httpStatus.NOT_FOUND, "User dose not exits!");

  if (isUserExist.isDeleted)
    throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");

  if (!isUserExist.isVerified)
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "User is not verified. Please verified first"
    );

  if (
    isUserExist.status === UserStatus.BLOCKED ||
    isUserExist.status === UserStatus.INACTIVE
  )
    throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.status}`);

  const jwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const resetToken = generateToken(
    jwtPayload,
    envVars.JWT_RESET_SECRET,
    envVars.JWT_RESET_EXPIRES
  );

  const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;

  sendEmail({
    to: isUserExist.email,
    subject: "Password Reset",
    templateName: "forgotPassword",
    templateData: {
      name: isUserExist.name,
      resetUILink,
    },
  });
};

const resetPassword = async (
  payload: Record<string, string>,
  decodedToken: JwtPayload
) => {
  if (payload.id !== decodedToken.userId)
    throw new AppError(httpStatus.BAD_REQUEST, "You can't reset password");

  const isUserExits = await User.findById(decodedToken.userId);
  if (!isUserExits)
    throw new AppError(httpStatus.NOT_FOUND, "User does not exits");

  const isNewPassword = await bcryptjs.compare(
    payload.newPassword,
    isUserExits?.password as string
  );

  if (isNewPassword)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This new password same to old password. Try another password!"
    );

  const hashedPassword = await bcryptjs.hash(
    payload.newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  isUserExits.password = hashedPassword;
  await isUserExits.save();
};

export const AuthService = {
  getNewAccessToken,
  changePassword,
  setPassword,
  forgotPassword,
  resetPassword,
};
