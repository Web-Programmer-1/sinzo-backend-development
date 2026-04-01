import express from "express";
import { UserRole } from "@prisma/client";
import authGuard from "../../middlewares/AuthGurd";
import { SteadfastController } from "./steadfast.controller";

const router = express.Router();

router.post(
  "/send/:id",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  SteadfastController.sendSingleOrder
);

router.post(
  "/send-bulk",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  SteadfastController.sendBulkOrders
);

router.get(
  "/sync-status/:id",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  SteadfastController.syncCourierStatus
);





router.get(
  "/history",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  SteadfastController.getSteadfastHistory
);

router.get(
  "/history/:id",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  SteadfastController.getSteadfastHistoryById
);


router.get(
  "/history/:id/download",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  SteadfastController.downloadSteadfastHistoryPdf
);

router.delete(
  "/history/:id",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  SteadfastController.deleteSteadfastHistory
);




export const steadfastRoutes = router;