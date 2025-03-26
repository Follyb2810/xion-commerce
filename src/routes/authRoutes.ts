import express from "express";
import { allUser, login, register, removeUserRole, SingleUser, UserProfile, verifyUser } from "../controllers/authController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.get("/user", allUser);
router.post("/register", register);
router.post("/login", login);
router.get("/profile", auth, UserProfile);
router.get("/verify/:id", auth, verifyUser);
router.put("/remove-role/:id",auth, removeUserRole);
router.get("/user/:id", auth, SingleUser);
// router.get("/profile", auth, UserProfile);
// router.post("/register", ValidateRequest.validateUserAuth(), ValidateRequest.validateMiddleware, register);
// router.post("/login", ValidateRequest.validateUserAuth(), ValidateRequest.validateMiddleware, login);
export default router;
