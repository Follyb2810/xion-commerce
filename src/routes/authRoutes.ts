import express from "express";
import { allUser, getCheckoutData, login, register, removeUserRole, SingleUser, updateUserProfile, UserProfile, verifyUser } from "../controllers/authController";
import { auth } from "../middleware/auth";
import MulterService from "../utils/multer";
import { getKycStatus, uploadKycDocuments, verifyKYC } from "../controllers/kycController";

const router = express.Router();

router.get("/user", allUser);
router.post("/register", register);
router.post("/login", login);
router.get("/profile", auth, UserProfile);
router.get("/check_out/:walletAddress", auth, getCheckoutData);
router.get("/verify/:id", auth, verifyUser);
router.put("/remove-role/:id",auth, removeUserRole);
router.get("/user/:id", auth, SingleUser);
router.patch("/profile", auth, updateUserProfile);
router.post('/kyc/upload', auth, MulterService.uploadSingle('kycDocuments'), uploadKycDocuments);
router.get('/kyc/status', auth, getKycStatus);
router.post('/kyc/admin/update', auth,verifyKYC);


export default router;
