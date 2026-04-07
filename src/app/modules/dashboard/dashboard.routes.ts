import express from "express";

import { UserRole } from "@prisma/client";
import authGuard from "../../middlewares/AuthGurd";
import { DashboardController } from "./dashboard.controller";

const router = express.Router();

router.get(
  "/overview",
  authGuard(UserRole.ADMIN),
  DashboardController.getOverview
);

export const DashboardRoutes = router;