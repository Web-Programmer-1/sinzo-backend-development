import express from "express";
import { SettingController } from "./setting.controller";
import { uploadSettingLogo } from "../../middlewares/upload.setting";
import authGuard from "../../middlewares/AuthGurd";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get("/", SettingController.getSetting);

router.post(
  "/create-logo",
  authGuard(UserRole.ADMIN),
  uploadSettingLogo.single("logo"),
  SettingController.createLogo
);

router.patch(
  "/logo",
  authGuard(UserRole.ADMIN),
  uploadSettingLogo.single("logo"),
  SettingController.updateLogo
);

router.delete("/", authGuard(UserRole.ADMIN), SettingController.deleteSetting);

export const SettingRoutes = router;