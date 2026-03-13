import express from "express";
import { CartController } from "./cart.controller";
import { UserRole } from "@prisma/client";
import authGuard from "../../middlewares/AuthGurd";
// import auth from "../../middlewares/auth";

const router = express.Router();



router.post("/",  authGuard(UserRole.CUSTOMER, UserRole.ADMIN), CartController.addToCart);
router.get("/",authGuard(UserRole.CUSTOMER, UserRole.ADMIN), CartController.getMyCart);
router.patch("/:cartId", authGuard(UserRole.CUSTOMER, UserRole.ADMIN), CartController.updateCartItem);
router.delete("/:cartId", authGuard(UserRole.CUSTOMER, UserRole.ADMIN), CartController.removeCartItem);
router.delete("/", authGuard(UserRole.CUSTOMER, UserRole.ADMIN), CartController.clearMyCart);

export const cartRoutes = router;