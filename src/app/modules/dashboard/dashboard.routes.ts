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




// router.get(
//   "/customer/dashboard-overview",

//   DashboardController.getCustomerDashboardOverview
// )



router.get(
  "/customer/dashboard-overview",
  authGuard(UserRole.CUSTOMER, UserRole.ADMIN), 
  DashboardController.getCustomerDashboardOverview
);



export const DashboardRoutes = router;