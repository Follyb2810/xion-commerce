"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const orderController_1 = require("../controllers/orderController");
const CheckStock_1 = require("../middleware/CheckStock");
const router = (0, express_1.Router)();
router.get('/', auth_1.auth, orderController_1.getDirectPurchaseHistory);
router.get('/user_order', auth_1.auth, orderController_1.getUserOrder);
router.get('/all', auth_1.auth, orderController_1.allOrder);
router.get('/all_user_order', auth_1.auth, orderController_1.getUserPurchaseHistory);
router.put('/:orderId/status', auth_1.auth, orderController_1.updateOrderStatus);
// router.put( "/escrow/:orderId", auth,releaseOrCancelEscrow, updateOrderStatus);
router.post('/available', auth_1.auth, CheckStock_1.CheckStock, orderController_1.checkProductAvailability);
router.post('/confirm', auth_1.auth, orderController_1.confirmDirectPurchase);
/**
AuthMiddleware, // Ensure user authentication
  releaseOrCancelEscrow, // First, process escrow transaction
  updateOrderStatus
*/
exports.default = router;
