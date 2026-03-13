import express from "express";
import { UserRole } from "@prisma/client";
import authGuard from "../../middlewares/AuthGurd";
import { SteadfastController } from "./steadfast.controller";

const router = express.Router();

router.post(
  "/send/:id",
  authGuard(UserRole.ADMIN),
  SteadfastController.sendSingleOrder
);

router.post(
  "/send-bulk",
  authGuard(UserRole.ADMIN),
  SteadfastController.sendBulkOrders
);

router.get(
  "/sync-status/:id",
  authGuard(UserRole.ADMIN),
  SteadfastController.syncCourierStatus
);

export const steadfastRoutes = router;