import express from "express";
import { UserRole } from "@prisma/client";
import authGuard from "../../middlewares/AuthGurd";
import { OrderController } from "./order.controller";

const router = express.Router();

// customer
router.post(
  "/place-order",
  authGuard(UserRole.CUSTOMER, UserRole.ADMIN),
  OrderController.placeOrder
);

router.get(
  "/my-orders",
  authGuard(UserRole.CUSTOMER, UserRole.ADMIN),
  OrderController.getMyOrders
);

router.get(
  "/my-orders/:id",
  authGuard(UserRole.CUSTOMER, UserRole.ADMIN),
  OrderController.getMySingleOrder
);

// admin
router.patch(
  "/status/:id",
  authGuard(UserRole.ADMIN),
  OrderController.updateOrderStatus
);



router.get("/track/:orderNumber", 
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  OrderController.trackOrder);



  // ----------------------------ADMIN-API-------------


  router.get(
  "/",
  authGuard(UserRole.ADMIN),
  OrderController.getAllOrders
);


router.get(
  "/:id",
  authGuard(UserRole.ADMIN),
  OrderController.getOrderById
);




router.patch(
  "/:id/status",
  authGuard(UserRole.ADMIN),
  OrderController.updateOrderStatus
);


router.patch(
  "/payment-status/:id",
  authGuard(UserRole.ADMIN),
  OrderController.updatePaymentStatus
);





export const orderRoutes = router;