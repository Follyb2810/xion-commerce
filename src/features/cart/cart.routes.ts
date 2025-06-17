import { Router } from "express";
import { auth } from "./../../middleware/auth";
import {
  addToCart,
  deleteUserCart,
  getCart,
  checkCartProductAvailable,
  removeCart,
} from "./cart.controller";
import { CheckStock } from "./../../middleware/CheckStock";
import { CheckCart } from "./../../middleware/CheckCart";
import checkCache from "../../middleware/checkCache";

const router = Router();

router.post(
  "/add_to_cart",
  auth,
  checkCache((req) => `carts:${req._id}`),
  addToCart
);
router.post(
  "/buy_from_cart",
  auth,
  CheckStock,
  CheckCart,
  checkCartProductAvailable
); // single product from cart
router.get(
  "/user_cart",
  auth,
  checkCache((req) => `cart-${req._id}`),
  getCart
);
router.put("/remove_from_cart", auth, removeCart);
router.delete("/:cartId", auth, deleteUserCart);

export default router;
