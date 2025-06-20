"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../middleware/auth");
const express_1 = __importDefault(require("express"));
const wallet_controller_1 = require("./wallet.controller");
const router = express_1.default.Router();
router.post("/wallet", wallet_controller_1.authWallet);
router.put("/profile", auth_1.auth, wallet_controller_1.authUpdateWallet);
exports.default = router;
