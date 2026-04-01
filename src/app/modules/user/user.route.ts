import { Router } from "express";
import { UserControllers } from "./user.controller";
import authGuard from "../../middlewares/AuthGurd";
import { UserRole } from "@prisma/client";
import { uploadImage } from "../../image-uploader/product.upload";

const router = Router();

router.post("/register", UserControllers.registerUser);
router.post("/login", UserControllers.loginUser);
router.post("/forgot-password", UserControllers.forgotPassword);

router.get("/me", authGuard("ADMIN", "CUSTOMER"), UserControllers.getMe);

router.get("/", authGuard(UserRole.ADMIN, UserRole.CUSTOMER), UserControllers.getAllUsers);
router.get("/:id", authGuard("ADMIN"), UserControllers.getUserById);
router.patch(
  "/:id",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  uploadImage.single("profileImage"),
  UserControllers.updateUser
);
router.delete("/:id", authGuard("ADMIN"), UserControllers.deleteUser);

router.patch("/block/:id", authGuard("ADMIN"), UserControllers.blockUser);
router.patch("/unblock/:id", authGuard("ADMIN"), UserControllers.unblockUser);

export const UserRoutes = router;