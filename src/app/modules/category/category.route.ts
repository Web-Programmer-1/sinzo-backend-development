import { Router } from "express";
import { UserRole } from "@prisma/client";
import authGuard from "../../middlewares/AuthGurd";

import { CategoryControllers } from "./category.controller";
import { uploadImage } from "../../image-uploader/product.upload";

const router = Router();

router.post(
  "/create-category",
  authGuard(UserRole.ADMIN),
  uploadImage.single("thumbnailImage"),
  CategoryControllers.createCategory
);

router.get("/", CategoryControllers.getAllCategories);
router.get("/:id", CategoryControllers.getCategoryById);

router.patch(
  "/:id",
  authGuard(UserRole.ADMIN),
  uploadImage.single("thumbnailImage"),
  CategoryControllers.updateCategory
);

router.delete(
  "/:id",
  authGuard(UserRole.ADMIN),
  CategoryControllers.deleteCategory
);

export const CategoryRoutes = router;