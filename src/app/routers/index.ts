import { Router } from "express";
import { UserRouters } from "../modules/user/user.route";
import { AuthRouters } from "../modules/auth/auth.route";
import { ProductRouters } from "../modules/product/product.route";
import { CategoryRouters } from "../modules/category/category.route";
import { CartRouter } from "../modules/cart/cart.route";
import { OrderRouters } from "../modules/order/order.route";

export const router = Router();

const moduleRouters = [
  {
    path: "/user",
    router: UserRouters,
  },
  {
    path: "/auth",
    router: AuthRouters,
  },
  {
    path: "/category",
    router: CategoryRouters,
  },
  {
    path: "/product",
    router: ProductRouters,
  },
  {
    path: "/cart",
    router: CartRouter,
  },
  {
    path: "/order",
    router: OrderRouters,
  },
];

moduleRouters.forEach((route) => {
  router.use(route.path, route.router);
});
