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



router.get(
  "/sync-status/:id",
  authGuard(UserRole.ADMIN),
  SteadfastController.syncCourierStatus
);





router.get(
  "/history",
  authGuard(UserRole.ADMIN),
  SteadfastController.getSteadfastHistory
);

router.get(
  "/history/:id",
  authGuard(UserRole.ADMIN),
  SteadfastController.getSteadfastHistoryById
);


router.get(
  "/history/:id/download",
  authGuard(UserRole.ADMIN),
  SteadfastController.downloadSteadfastHistoryPdf
);

router.delete(
  "/history/:id",
  authGuard(UserRole.ADMIN),
  SteadfastController.deleteSteadfastHistory
);




export const steadfastRoutes = router;