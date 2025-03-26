"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const walletController_1 = require("../controllers/walletController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post("/wallet", walletController_1.authWallet);
router.put("/profile", auth_1.auth, walletController_1.updateProfile);
exports.default = router;
// router.route('/profile').put(auth,updateProfile)
// router.route('/profile')
//   .get(auth, getProfile)    // GET request
//   .put(auth, updateProfile) // PUT request
//   .delete(auth, deleteProfile); // DELETE reque
