"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const xionController_1 = require("../controllers/xionController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// ?address=address
router.get('/balance', xionController_1.getAddressBalance);
router.post('/send_to_escrow', auth_1.auth, xionController_1.sendXionToEscrowContract);
exports.default = router;
