import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { StatsController } from "./stats.controller";

const router = Router();

router.get(
  "/user",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  StatsController.getUserStats
);

router.get(
  "/product",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  StatsController.getProductStats
);

router.get(
  "/order",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  StatsController.getOrderStats
);

export const StatsRouters = router;
