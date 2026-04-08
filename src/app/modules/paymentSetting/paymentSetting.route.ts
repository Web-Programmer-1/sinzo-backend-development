import express from "express";
import { PaymentSettingController } from "./paymentSetting.controller";

const router = express.Router();

router.post("/", PaymentSettingController.createPaymentSetting);
router.get("/", PaymentSettingController.getPaymentSetting);
router.get("/:id", PaymentSettingController.getPaymentSettingById);
router.patch("/:id", PaymentSettingController.updatePaymentSetting);
router.delete("/:id", PaymentSettingController.deletePaymentSetting);

export const PaymentSettingRoutes = router;