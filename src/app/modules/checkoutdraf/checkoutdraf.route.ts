import express from "express";

import { UserRole } from "@prisma/client";
import { CheckoutDraftController } from "./checkoutdraf.controller";
import authGuard from "../../middlewares/AuthGurd";

const router = express.Router();

router.post("/", CheckoutDraftController.createCheckoutDraft);
router.patch("/:id", CheckoutDraftController.updateCheckoutDraft);

router.get(
  "/",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  CheckoutDraftController.getAllCheckoutDrafts
);

router.delete("/:id", CheckoutDraftController.deleteCheckoutDraft);

export const CheckoutDraftRoutes = router;