import { auth } from "../../middleware/auth";
import express from "express";
import { authUpdateWallet, authWallet } from "./wallet.controller";

const router = express.Router();

router.post("/wallet", authWallet);
router.put("/profile", auth, authUpdateWallet);

export default router;
