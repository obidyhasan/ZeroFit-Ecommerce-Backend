import { NextFunction, Request, Response, Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  changePasswordUserZodSchema,
  forgotPasswordUserZodSchema,
  loginUserZodSchema,
  resetPasswordUserZodSchema,
  setPasswordUserZodSchema,
} from "./auth.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import passport from "passport";
import { envVars } from "../../config/env";

const router = Router();

router.post(
  "/login",
  validateRequest(loginUserZodSchema),
  AuthController.credentialsLogin
);
router.post("/refresh-token", AuthController.getNewAccessToken);
router.post("/logout", AuthController.logout);
router.post(
  "/change-password",
  validateRequest(changePasswordUserZodSchema),
  checkAuth(...Object.values(Role)),
  AuthController.changePassword
);
router.post(
  "/set-password",
  validateRequest(setPasswordUserZodSchema),
  checkAuth(...Object.values(Role)),
  AuthController.setPassword
);
router.post(
  "/forgot-password",
  validateRequest(forgotPasswordUserZodSchema),
  AuthController.forgotPassword
);
// reset password for forgot password
// Frontend -> forget-password -> email -> user status check -> short expiration token (valid for 10 min) -> email -> Frontend Link http://localhost:5173/reset-password?email=obidyhasan@gmail.com&token=token -> frontend e query theke user er email and token extract anbo -> new password user theke nibe -> backend er /reset-password api -> authorization = token -> newPassword -> token verify -> password hash -> user password
router.post(
  "/reset-password",
  validateRequest(resetPasswordUserZodSchema),
  checkAuth(...Object.values(Role)),
  AuthController.resetPassword
);

// /booking -> /login -> successful google login -> /booking frontend
// /login -> successful google login -> / frontend
// api/v1/auth/google/callback?state=/booking
router.get(
  "/google",
  async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect || "/";
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: redirect as string,
    })(req, res, next);
  }
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${envVars.FRONTEND_URL}/login?error=There is some issues with your account. Please contact with our support team!`,
  }),
  AuthController.googleCallbackController
);

export const AuthRouters = router;
