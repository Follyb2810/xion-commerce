import express, { Request, Response, NextFunction, RequestHandler } from "express";
import { authWallet, updateProfile } from "../controllers/walletController";
import { auth } from "../middleware/auth";
import MongodbValidate from "../utils/MongodbValidate";

const router = express.Router();

router.post("/wallet", authWallet);
router.put("/profile", auth, updateProfile);

export default router;



// router.route('/profile').put(auth,updateProfile)
// router.route('/profile')
//   .get(auth, getProfile)    // GET request
//   .put(auth, updateProfile) // PUT request
//   .delete(auth, deleteProfile); // DELETE reque