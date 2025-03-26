import { Router } from "express";
import { auth } from "../middleware/auth";
import { checkProductAvailability, confirmDirectPurchase, getUserOrder, getDirectPurchaseHistory, allOrder, getUserPurchaseHistory, updateOrderStatus } from "../controllers/orderController";
import { CheckStock } from "../middleware/CheckStock";

const router = Router()

router.get('/', auth, getDirectPurchaseHistory)
router.get('/user_order',auth,getUserOrder)
router.get('/all',auth,allOrder)
router.get('/all_user_order',auth,getUserPurchaseHistory)
router.put('/:orderId/status', auth, updateOrderStatus);
router.post('/available',auth,CheckStock,checkProductAvailability)
router.post('/confirm',auth,confirmDirectPurchase)


export default router