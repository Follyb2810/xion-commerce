import express from "express";
import {
  allUser,
  getCheckoutData,
  login,
  register,
  updateUserRole,
  SingleUser,
  updateUserProfile,
  UserProfile,
  verifyUser,
} from "./user.controller";
import { auth } from "./../../middleware/auth";
import MulterService from "./../../common/libs/multer";
import { getKycStatus, uploadKycDocuments, verifyKYC } from "./kyc.controller";
import checkCache from "../../middleware/checkCache";
import { verifyRole } from "../../middleware/verifyRole";
import { Roles } from "../../common/types/IUser";

const router = express.Router();

router.get(
  "/user",
  auth,
  verifyRole(Roles.ADMIN),
  checkCache((req) => `users:list`),
  allUser
);
router.post("/register", register);
router.post("/login", login);
router.get(
  "/profile",
  auth,
  checkCache((req) => `user:${req._id}`),
  UserProfile
);
router.get(
  "/check_out/:walletAddress",
  auth,
  auth,
  checkCache((req) => `user:${req.params.walletAddress}`),
  getCheckoutData
);
router.get("/verify/:id", auth, verifyUser);
router.patch("/update-role/:id", auth, verifyRole(Roles.ADMIN), updateUserRole);
router.get("/user/:id", auth, SingleUser);
router.patch("/profile", auth, updateUserProfile);
router.post(
  "/kyc/upload",
  auth,
  MulterService.uploadSingle("kycDocuments"),
  uploadKycDocuments
);
router.get("/kyc/status", auth, getKycStatus);
router.post("/kyc/admin/update", auth, verifyKYC);

export default router;
