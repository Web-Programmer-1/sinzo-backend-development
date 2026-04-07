import express from "express";
import { SettingController } from "./setting.controller";
import { uploadSettingLogo } from "../../middlewares/upload.setting";

const router = express.Router();

router.get("/", SettingController.getSetting);

router.post(
  "/create-logo",
  uploadSettingLogo.single("logo"),
  SettingController.createLogo
);

router.patch(
  "/logo",
  uploadSettingLogo.single("logo"),
  SettingController.updateLogo
);

router.delete("/", SettingController.deleteSetting);

export const SettingRoutes = router;