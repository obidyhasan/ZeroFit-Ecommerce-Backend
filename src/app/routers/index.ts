import { Router } from "express";
import { UserRouters } from "../modules/user/user.route";
import { AuthRouters } from "../modules/auth/auth.route";

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
];

moduleRouters.forEach((route) => {
  router.use(route.path, route.router);
});
