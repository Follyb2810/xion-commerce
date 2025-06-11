import { Router } from "express";
import { auth } from "./../../middleware/auth";
import { checkProductAvailability, directPurchase, getUserOrder, getDirectPurchaseHistory, allOrder, getUserPurchaseHistory, updateOrderStatus } from "./order.controller";
import { CheckStock } from "./../../middleware/CheckStock";


const router = Router()

router.get('/', auth, getDirectPurchaseHistory)
router.get('/user_order',auth,getUserOrder)
router.get('/all',auth,allOrder)
router.get('/all_user_order',auth,getUserPurchaseHistory)
router.put('/:orderId/status', auth, updateOrderStatus);
// router.put( "/escrow/:orderId", auth,releaseOrCancelEscrow, updateOrderStatus);
router.post('/available',auth,CheckStock,checkProductAvailability)
router.post('/confirm',auth,directPurchase)
/**
AuthMiddleware, // Ensure user authentication
  releaseOrCancelEscrow, // First, process escrow transaction
  updateOrderStatus 
*/


export default router