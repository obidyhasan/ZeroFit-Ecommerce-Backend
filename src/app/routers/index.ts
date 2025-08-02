import { Router } from "express";
import { UserRouters } from "../modules/user/user.route";

export const router = Router();

const moduleRouters = [
  {
    path: "/user",
    router: UserRouters,
  },
];

moduleRouters.forEach((route) => {
  router.use(route.path, route.router);
});
