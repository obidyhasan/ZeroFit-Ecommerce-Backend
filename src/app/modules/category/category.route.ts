import { Role } from "./../user/user.interface";
import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createCategoryZodSchema,
  updateCategoryZodSchema,
} from "./category.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { CategoryController } from "./category.controller";
import { multerUpload } from "../../config/multer.config";

const router = Router();

// ------------------ Category --------------------
router.post(
  "/create",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  multerUpload.single("file"),
  validateRequest(createCategoryZodSchema),
  CategoryController.createCategory
);

router.get("/", CategoryController.getAllCategory);
router.get("/:slug", CategoryController.getSingleCategory);
router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.single("file"),
  validateRequest(updateCategoryZodSchema),
  CategoryController.updateCategory
);
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CategoryController.deleteCategory
);

export const CategoryRouters = router;
