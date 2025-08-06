import { Role } from "./../user/user.interface";
import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createProductZodSchema,
  updateProductZodSchema,
} from "./product.validation";
import { ProductController } from "./product.controller";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  multerUpload.array("files"),
  validateRequest(createProductZodSchema),
  ProductController.createProduct
);
router.get("/", ProductController.getAllProduct);
router.get("/:slug", ProductController.getSingleProduct);
router.patch(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  multerUpload.array("files"),
  validateRequest(updateProductZodSchema),
  ProductController.updateProduct
);
router.delete(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  ProductController.deleteProduct
);

export const ProductRouters = router;
