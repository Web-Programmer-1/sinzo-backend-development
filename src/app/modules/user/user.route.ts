import { Router } from "express";
import { UserControllers } from "./user.controller";
import authGuard from "../../middlewares/AuthGurd";
import { UserRole } from "@prisma/client";
import { uploadImage } from "../../image-uploader/product.upload";
import { loginLimiter } from "../../../util/LoginAttempt";

const router = Router();

router.post("/register", UserControllers.registerUser);
router.post("/login",loginLimiter, UserControllers.loginUser);
router.post("/logout", UserControllers.logoutUser);
router.post("/forgot-password", UserControllers.forgotPassword);

router.get("/me", authGuard(UserRole.ADMIN, UserRole.CUSTOMER), UserControllers.getMe);

router.get("/", authGuard(UserRole.ADMIN, UserRole.CUSTOMER), UserControllers.getAllUsers);
router.get("/:id", authGuard(UserRole.ADMIN), UserControllers.getUserById);
router.patch(
  "/:id",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER),
  uploadImage.single("profileImage"),
  UserControllers.updateUser
);
router.delete("/:id", authGuard(UserRole.ADMIN), UserControllers.deleteUser);

router.patch("/block/:id", authGuard(UserRole.ADMIN), UserControllers.blockUser);
router.patch("/unblock/:id", authGuard(UserRole.ADMIN), UserControllers.unblockUser);

export const UserRoutes = router;