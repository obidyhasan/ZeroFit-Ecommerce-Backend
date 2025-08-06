import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { createOrderZodSchema, updateOrderZodSchema } from "./order.validation";
import { OrderController } from "./order.controller";

const router = Router();

router.post(
  "/create",
  checkAuth(...Object.values(Role)),
  validateRequest(createOrderZodSchema),
  OrderController.createOrder
);

router.get(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  OrderController.getAllOrders
);

router.get(
  "/me",
  checkAuth(...Object.values(Role)),
  OrderController.getMyOrders
);

router.patch(
  "/:id",
  checkAuth(...Object.values(Role)),
  validateRequest(updateOrderZodSchema),
  OrderController.updateOrder
);

router.delete(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  OrderController.deleteOrder
);

router.get(
  "/invoice/:orderId",
  checkAuth(...Object.values(Role)),
  OrderController.getInvoiceDownloadUrl
);

export const OrderRouters = router;
