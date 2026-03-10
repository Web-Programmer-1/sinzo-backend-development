import { Router } from "express";
import { ProductControllers } from "./product.controller";
import authGuard from "../../middlewares/AuthGurd";
import { UserRole } from "@prisma/client";
import { uploadImage } from "../../image-uploader/product.upload";

const router = Router();

router.post(
  "/create-product",
  authGuard(UserRole.ADMIN),
  uploadImage.fields([
        { name: "productCardImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
    { name: "sizeGuideImage", maxCount: 1 },
  ]),
  ProductControllers.createProduct
);


router.get("/", ProductControllers.getAllProducts);


router.get("/:slug", ProductControllers.getSingleProduct);



export const ProductRoutes = router;