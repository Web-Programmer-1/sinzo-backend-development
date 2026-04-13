import express from "express";
import { UserRole } from "@prisma/client";
import authGuard from "../../middlewares/AuthGurd";
import { OrderController } from "./order.controller";

const router = express.Router();



router.get(
  "/customer-ranking",
  
  OrderController.getCustomerRanking
);



// customer
router.post(
  "/place-order",
 
  OrderController.placeOrder
);

router.get(
  "/my-orders",
 
  OrderController.getMyOrders
);

router.get(
  "/my-orders/:id",

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
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  OrderController.getAllOrders
);


router.get(
  "/:id",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER ),
  OrderController.getOrderById
);




router.patch(
  "/:id/status",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  OrderController.updateOrderStatus
);


router.patch(
  "/payment-status/:id",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  OrderController.updatePaymentStatus
);


router.delete(
  "/:id",
  authGuard(UserRole.ADMIN),
  OrderController.deleteOrder
);



router.patch(
  "/:id/customer-info",
  authGuard(UserRole.ADMIN),
  OrderController.updateOrderCustomerInfo
);



router.get(
  "/:id/invoice",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  OrderController.generateInvoice
);



export const orderRoutes = router;