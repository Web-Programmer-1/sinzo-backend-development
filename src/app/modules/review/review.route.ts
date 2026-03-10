import { Router } from "express";
import { UserRole } from "@prisma/client";
import authGuard from "../../middlewares/AuthGurd";
import { ReviewControllers } from "./review.controller";

const router = Router();

router.post(
  "/",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  ReviewControllers.createReview
);

router.get(
  "/product/:productId",
  ReviewControllers.getReviewsByProduct
);

router.patch(
  "/:reviewId",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  ReviewControllers.updateReview
);


router.delete(
  "/:reviewId",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  ReviewControllers.deleteReview
);



export const ReviewRoutes = router;