import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../modules/user/user.model";
import { UserStatus } from "../modules/user/user.interface";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization;
      if (!accessToken)
        throw new AppError(httpStatus.FORBIDDEN, "No token receive");

      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;

      const isUserExits = await User.findOne({ email: verifiedToken.email });

      if (!isUserExits)
        throw new AppError(httpStatus.BAD_REQUEST, "User dose not exits!");

      if (isUserExits.isDeleted)
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");

      // if (!isUserExits.isVerified)
      //   throw new AppError(httpStatus.BAD_REQUEST, "User is not verified!");

      if (
        isUserExits.status === UserStatus.BLOCKED ||
        isUserExits.status === UserStatus.INACTIVE
      )
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `User is ${isUserExits.status}`
        );

      // Check Is user access this route
      if (!authRoles.includes(verifiedToken.role))
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "You are not permitted to new this route!"
        );

      req.user = verifiedToken;
      next();
    } catch (error) {
      next(error);
    }
  };
