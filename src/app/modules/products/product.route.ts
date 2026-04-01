import { Router } from "express";
import { ProductControllers } from "./product.controller";
import authGuard from "../../middlewares/AuthGurd";
import { UserRole } from "@prisma/client";
import { uploadImage } from "../../image-uploader/product.upload";

const router = Router();



router.post(
  "/create-product",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  uploadImage.fields([
    { name: "productCardImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
    { name: "sizeGuideImage", maxCount: 1 },

    { name: "colorImages_BLACK", maxCount: 10 },
    { name: "colorImages_WHITE", maxCount: 10 },
    { name: "colorImages_BLUE", maxCount: 10 },
    { name: "colorImages_RED", maxCount: 10 },
    { name: "colorImages_GREEN", maxCount: 10 },
    { name: "colorImages_YELLOW", maxCount: 10 },
    { name: "colorImages_GRAY", maxCount: 10 },
    { name: "colorImages_BROWN", maxCount: 10 },
    { name: "colorImages_NAVY", maxCount: 10 },
    { name: "colorImages_PINK", maxCount: 10 },
    { name: "colorImages_PURPLE", maxCount: 10 },
    { name: "colorImages_ORANGE", maxCount: 10 },
  ]),
  ProductControllers.createProduct
);






router.get("/", ProductControllers.getAllProducts);


router.get("/:slug", ProductControllers.getSingleProduct);



router.patch(
  "/:id",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  uploadImage.fields([
    { name: "productCardImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
    { name: "sizeGuideImage", maxCount: 1 },

    { name: "colorImages_BLACK", maxCount: 10 },
    { name: "colorImages_WHITE", maxCount: 10 },
    { name: "colorImages_BLUE", maxCount: 10 },
    { name: "colorImages_RED", maxCount: 10 },
    { name: "colorImages_GREEN", maxCount: 10 },
    { name: "colorImages_YELLOW", maxCount: 10 },
    { name: "colorImages_GRAY", maxCount: 10 },
    { name: "colorImages_BROWN", maxCount: 10 },
    { name: "colorImages_NAVY", maxCount: 10 },
    { name: "colorImages_PINK", maxCount: 10 },
    { name: "colorImages_PURPLE", maxCount: 10 },
    { name: "colorImages_ORANGE", maxCount: 10 },
  ]),
  ProductControllers.updateProduct
);

router.delete(
  "/:id",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  ProductControllers.deleteProduct
);


router.get("/related/:productId", ProductControllers.getRelatedProducts);

export const ProductRoutes = router;