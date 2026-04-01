import express from "express";
import { WishlistController } from "./wishlist.controller";

const router = express.Router();

router.post("/add", WishlistController.addToWishlist);
router.post("/toggle", WishlistController.toggleWishlist);
router.get("/my-wishlist", WishlistController.getMyWishlist);
router.get("/count", WishlistController.getWishlistCount);
router.delete("/remove/:wishlistId", WishlistController.removeFromWishlist);
router.delete(
  "/remove-by-product/:productId",
  WishlistController.removeWishlistByProductId
);
router.delete("/clear", WishlistController.clearMyWishlist);

export const WishlistRoutes = router;