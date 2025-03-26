"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const CartController_1 = require("../controllers/CartController");
const CheckStock_1 = require("../middleware/CheckStock");
const CheckCart_1 = require("../middleware/CheckCart");
const router = (0, express_1.Router)();
router.post('/add_to_cart', auth_1.auth, CartController_1.addToCart);
router.post('/buy_from_cart', auth_1.auth, CheckStock_1.CheckStock, CheckCart_1.CheckCart, CartController_1.checkCartProductAvailable); // single product from cart
router.get('/user_cart', auth_1.auth, CartController_1.getCart);
router.put('/remove_from_cart', auth_1.auth, CartController_1.removeCart);
router.delete('/:cartId', auth_1.auth, CartController_1.deleteUserCart);
exports.default = router;
