import {Router} from 'express'
import { auth } from './../../middleware/auth'
import { addToCart, deleteUserCart, getCart, checkCartProductAvailable, removeCart } from './cart.controller'
import { CheckStock } from './../../middleware/CheckStock'
import { CheckCart } from './../../middleware/CheckCart'

const router = Router()

router.post('/add_to_cart',auth,addToCart)
router.post('/buy_from_cart',auth,CheckStock,CheckCart,checkCartProductAvailable) // single product from cart
router.get('/user_cart',auth,getCart)
router.put('/remove_from_cart',auth,removeCart)
router.delete('/:cartId',auth,deleteUserCart)

export default router