import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { createCartZodSchema, updateCartZodSchema } from "./cart.validation";
import { CartController } from "./cart.controller";

const router = Router();

router.post(
  "/create",
  checkAuth(...Object.values(Role)),
  validateRequest(createCartZodSchema),
  CartController.createCart
);
router.get(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  CartController.getAllCart
);
router.get("/me", checkAuth(...Object.values(Role)), CartController.getMyCart);
router.patch(
  "/:id",
  checkAuth(...Object.values(Role)),
  validateRequest(updateCartZodSchema),
  CartController.updateCart
);
router.delete(
  "/:id",
  checkAuth(...Object.values(Role)),
  CartController.deleteCart
);

export const CartRouter = router;
