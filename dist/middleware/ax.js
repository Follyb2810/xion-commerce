"use strict";
// import { Request, Response, NextFunction } from 'express';
// import { Types } from 'mongoose';
// import { AsyncHandler } from '../utils/AsyncHandler';
// import { ErrorHandler } from '../utils/ErrorHandler';
// import { ProductRepository } from '../repositories/ProductRepository';
// import { CartRepository } from '../repositories/CartRepository';
// import { IUser } from '../interfaces/IUser';
// import { AuthRequest } from '../interfaces/AuthRequest';
// // Middleware to validate product ID
// export const validateProductId = AsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   const { productId } = req.body;
//   if (!Types.ObjectId.isValid(productId)) {
//     return ErrorHandler(res, "INVALID_PRODUCT_ID", 400);
//   }
//   next();
// });
// // Middleware to validate quantity
// export const validateQuantity = AsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   const { quantity = 1 } = req.body;
//   if (quantity <= 0) {
//     return ErrorHandler(res, "INVALID_QUANTITY", 400);
//   }
//   next();
// });
// // Middleware to check product existence and stock
// export const checkProductStock = AsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   const { productId, quantity = 1 } = req.body;
//   const product = await ProductRepository.findById(productId, [
//     { path: 'seller', select: 'walletAddress' }
//   ]);
//   if (!product) {
//     return ErrorHandler(res, "PRODUCT_NOT_FOUND", 404);
//   }
//   if (product.stock < quantity) {
//     return ErrorHandler(res, "INSUFFICIENT_STOCK", 400);
//   }
//   // Store product and seller info for later use
//   req.product = product;
//   req.seller = product.seller as IUser;
//   next();
// });
// // Middleware to check cart product existence
// export const validateCartProduct = AsyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
//   const userId = req._id;
//   const { productId, quantity } = req.body;
//   let cart = await CartRepository.findByEntity({ user: new Types.ObjectId(userId) });
//   if (!cart) {
//     return ErrorHandler(res, "CART_NOT_FOUND", 404);
//   }
//   const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
//   if (itemIndex === -1) {
//     return ErrorHandler(res, "PRODUCT_NOT_IN_CART", 404);
//   }
//   const productItem = cart.items[itemIndex];
//   if (quantity > productItem.quantity) {
//     return ErrorHandler(res, "INVALID_QUANTITY", 400);
//   }
//   // Store cart and item info for later use
//   req.cart = cart;
//   req.cartItemIndex = itemIndex;
//   next();
// });
// // Helper function to format response data
// export const formatProductResponse = (product: any, seller: IUser, quantity: number) => {
//   return {
//     productId: product._id,
//     quantity,
//     price: product.price,
//     totalAmount: product.price * quantity,
//     seller: seller._id,
//     sellerAddress: seller.walletAddress
//   };
// };
// // Import the middleware functions
// import { 
//     validateProductId, 
//     validateQuantity, 
//     checkProductStock, 
//     validateCartProduct, 
//     formatProductResponse 
//   } from '../middleware/productAvailabilityMiddleware';
//   import { AsyncHandler } from '../utils/AsyncHandler';
//   import { ResponseHandler } from '../utils/ResponseHandler';
//   import { AuthRequest } from '../interfaces/AuthRequest';
//   import { Response } from 'express';
//   // Updated controller functions
//   export const checkCartProductAvailable = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
//     const { quantity } = req.body;
//     const { product, seller } = req;
//     ResponseHandler(res, 200, "Product available", formatProductResponse(product, seller, quantity));
//   });
//   export const checkProductAvailability = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
//     const { quantity = 1 } = req.body;
//     const { product, seller } = req;
//     ResponseHandler(res, 200, "Product available", formatProductResponse(product, seller, quantity));
//   });
// Example of how to use these in your routes
/*
// For direct product availability check
router.post('/check-product',
  validateProductId,
  validateQuantity,
  checkProductStock,
  checkProductAvailability
);

// For cart product availability check
router.post('/check-cart-product',
  validateProductId,
  validateCartProduct,
  checkProductStock,
  checkCartProductAvailable
);
*/ 
