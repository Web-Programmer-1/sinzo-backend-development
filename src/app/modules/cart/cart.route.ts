import express from "express";
import { CartController } from "./cart.controller";

const router = express.Router();

router.post("/", CartController.addToCart);
router.get("/", CartController.getMyCart);
router.patch("/:cartId", CartController.updateCartItem);
router.delete("/:cartId", CartController.removeCartItem);
router.delete("/", CartController.clearMyCart);

export const cartRoutes = router;