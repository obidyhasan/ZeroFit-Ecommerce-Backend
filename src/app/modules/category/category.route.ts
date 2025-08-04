import { Role } from "./../user/user.interface";
import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createCategoryZodSchema,
  createSubCategoryZodSchema,
  updateCategoryZodSchema,
  updateSubCategoryZodSchema,
} from "./category.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { CategoryController } from "./category.controller";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post(
  "/sub/create",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  multerUpload.single("file"),
  validateRequest(createSubCategoryZodSchema),
  CategoryController.createSubCategory
);
router.post(
  "/create",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  multerUpload.single("file"),
  validateRequest(createCategoryZodSchema),
  CategoryController.createCategory
);

router.get("/sub", CategoryController.getAllSubCategory);
router.get("/", CategoryController.getAllCategory);

router.get("/sub/:slug", CategoryController.getSingleSubCategory);
router.get("/:slug", CategoryController.getSingleCategory);

router.patch(
  "/sub/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.single("file"),
  validateRequest(updateSubCategoryZodSchema),
  CategoryController.updateSubCategory
);
router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.single("file"),
  validateRequest(updateCategoryZodSchema),
  CategoryController.updateCategory
);

router.delete(
  "/sub/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CategoryController.deleteSubCategory
);
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CategoryController.deleteCategory
);

export const CategoryRouters = router;
