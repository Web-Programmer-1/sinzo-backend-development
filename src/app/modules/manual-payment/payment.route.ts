import express from "express";
import { ManualPaymentController } from "./payment.controller";
import { UserRole } from "@prisma/client";
import authGuard from "../../middlewares/AuthGurd";

const router = express.Router();

// 🔹 CUSTOMER + ADMIN (submit payment)
router.post(
  "/submit/:orderId",
  authGuard(UserRole.CUSTOMER, UserRole.ADMIN),
  ManualPaymentController.submitManualPayment
);

// 🔹 CUSTOMER + ADMIN (get own submission)
router.get(
  "/my-submission/:orderId",
  authGuard(UserRole.CUSTOMER, UserRole.ADMIN),
  ManualPaymentController.getMySubmissionByOrder
);

// 🔹 ADMIN ONLY (all payments list)
router.get(
  "/",
  authGuard(UserRole.ADMIN),
  ManualPaymentController.getAllPayments
);

// 🔹 ADMIN ONLY (single payment)
router.get(
  "/:id",
  authGuard(UserRole.ADMIN),
  ManualPaymentController.getSinglePayment
);

// 🔹 ADMIN ONLY (verify)
router.patch(
  "/verify/:id",
  authGuard(UserRole.ADMIN),
  ManualPaymentController.verifyPayment
);

// 🔹 ADMIN ONLY (reject)
router.patch(
  "/reject/:id",
  authGuard(UserRole.ADMIN),
  ManualPaymentController.rejectPayment
);

export const ManualPaymentRoutes = router;