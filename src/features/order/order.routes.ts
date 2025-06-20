import { Router } from "express";
import { auth } from "./../../middleware/auth";
import {
  checkProductAvailability,
  directPurchase,
  getUserOrder,
  getDirectPurchaseHistory,
  allOrder,
  getUserPurchaseHistory,
  updateOrderStatus,
} from "./order.controller";
import { CheckStock } from "./../../middleware/CheckStock";
import checkCache from "../../middleware/checkCache";
import { Roles } from "../../common/types/IUser";
import { verifyRole } from "../../middleware/verifyRole";

const router = Router();

router.get("/", auth, getDirectPurchaseHistory);
router.get("/user_order", auth, getUserOrder);
router.get(
  "/all_orders",
  auth,
  verifyRole(Roles.ADMIN),
  checkCache(() => `order:list`),
  allOrder
);
router.get(
  "/all_user_order",
  auth,
  checkCache((req) => `user:order:${req._id}:${req.query.status}`),
  getUserPurchaseHistory
);
router.put(
  "/:orderId/status",
  auth,
  updateOrderStatus
);
router.post("/available", auth, CheckStock, checkProductAvailability);
router.post("/confirm", auth, directPurchase);

export default router;
