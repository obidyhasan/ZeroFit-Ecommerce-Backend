import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";

const router = Router();

// Create User Router
router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserController.createUser
);

// Get All Users
router.get(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  UserController.getAllUsers
);

// Get My Profile
router.get("/me", checkAuth(...Object.values(Role)), UserController.getMe);

// User Update
router.patch(
  "/:id",
  validateRequest(updateUserZodSchema),
  checkAuth(...Object.values(Role)),
  UserController.updateUser
);

export const UserRouters = router;
