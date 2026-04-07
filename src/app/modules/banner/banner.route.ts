import express from "express";
import { BannerController } from "./banner.controller";
import { uploadImage } from "../../image-uploader/product.upload";

const router = express.Router();

router.post(
  "/create-banner",
  uploadImage.single("image"),
  BannerController.createBanner
);

router.get("/", BannerController.getAllBanners);

router.get("/:id", BannerController.getBannerById);

router.patch(
  "/:id",
  uploadImage.single("image"),
  BannerController.updateBanner
);

router.delete("/:id", BannerController.deleteBanner);

export const BannerRoutes = router;