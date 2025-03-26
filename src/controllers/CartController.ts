import { Request, Response } from "express";
import AsyncHandler from "express-async-handler";
import CartRepository from "../repositories/CartRepository";
import { AuthRequest } from "../middleware/auth";
import { Types } from "mongoose";
import ProductRepository from "../repositories/ProductRepository";
import UserRepository from "../repositories/UserRepository";
import { AppError, ErrorHandler, ResponseHandler } from "../utils/ResponseHandler";
import OrderRepository from "../repositories/OrderRepository";
import { OrderStatus as IOrderStatus } from "../types/IOrder";
import { IUser } from "../types/IUser";
import { ProductAuth } from "../middleware/CheckStock";
import { formatProductResponse } from "../middleware/ProductResponse";

export const addToCart = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req._id;
  const { productId, quantity = 1 } = req.body;

  const productData = await ProductRepository.findById(productId);
  if (!productData) {
    return ErrorHandler(res, "NOT_FOUND", 404);
  }
  if (quantity <= 0) {
    return ErrorHandler(res, "INVALID_QUANTITY", 400);
  }
  if (productData.stock < quantity) {
    return ErrorHandler(res, "INSUFFICIENT_STOCK", 400);
  }

  let cart = await CartRepository.findByEntity({ user: new Types.ObjectId(userId) });

  if (!cart) {
    cart = await CartRepository.create({
      user: new Types.ObjectId(userId),
      items: [{ product: new Types.ObjectId(productId), quantity, price: productData.price }],
      total: productData.price * quantity,
    });
  } else {
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    itemIndex > -1 ? (cart.items[itemIndex].quantity += quantity) : cart.items.push({
      product: new Types.ObjectId(productId),
      quantity,
      price: productData.price,
    });

    cart.total = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    await cart.save();
  }

  ResponseHandler(res, 200, "Cart Successfully Added");
});

export const getCart = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req._id;
  console.log(userId)
  const cart = await CartRepository.findByEntity({ user: userId }, undefined, "items.product");

  // if (!cart || cart.items.length === 0) {
  //   return ErrorHandler(res, "NOT_FOUND", 404);
  // }

  ResponseHandler(res, 200, "User Cart", cart);
});

export const removeCart = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req._id;
  const { productId, quantity = 1 } = req.body;
  console.log(userId)
  console.log(productId)
  console.log(quantity)
  if (!Types.ObjectId.isValid(productId)) {
    return ErrorHandler(res, "FIELD_ERROR", 400);
  }
  
  const cart = await CartRepository.findByEntity({ user: new Types.ObjectId(userId) });
  console.log(cart)
  console.log(1)
  
  if (!cart) {
    return ErrorHandler(res, "NOT_FOUND", 404);
  }
  console.log(2)
  
  if (String(req._id) !== String(cart.user._id)) {
    return ErrorHandler(res, "UNAUTHORIZED", 403);
  }
  console.log(3)
  
  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
  
  if (itemIndex === -1) {
    return ErrorHandler(res, "NOT_FOUND", 404);
  }
  console.log(4)

  quantity >= cart.items[itemIndex].quantity
    ? cart.items.splice(itemIndex, 1)
    : (cart.items[itemIndex].quantity -= quantity);

  cart.total = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  await cart.save();

  ResponseHandler(res, 200, "Item removed from cart", cart);
});

export const deleteUserCart = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userCart = await CartRepository.findById(req.params.cartId);

  if (!userCart) {
    return ErrorHandler(res, "NOT_FOUND", 404);
  }

  if (String(req._id) !== String(userCart.user._id)) {
    return ErrorHandler(res, "UNAUTHORIZED", 403);
  }

  await CartRepository.deleteById(req.params.cartId);
  ResponseHandler(res, 200, "Cart deleted successfully");
});

//? single product processPayment
// Process payment for a single product in the cart
export const checkCartProductAvailable = AsyncHandler(async (req: ProductAuth, res: Response): Promise<void> => {
  const { quantity } = req.body;
      const { product, seller } = req;
  
    ResponseHandler(res, 200, "Product available", formatProductResponse(product,seller!,quantity));
})



//? all product on the checkout
//? // Checkout all items in the cart
export const checkout = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId: string | undefined = req._id;
  const { transactionHash } = req.body;

  if (!userId) {
    return ErrorHandler(res, "USER_NOT_FOUND", 400);
  }

  const cart = await CartRepository.findByEntity({ user: userId }, undefined, "items.product");
  if (!cart || cart.items.length === 0) {
    return ErrorHandler(res, "EMPTY_CART", 400);
  }

  let totalAmount = 0;
  const orderItems = [];
  const historyItems = [];
  const stockUpdates = [];

  for (const item of cart.items) {
    const productData = await ProductRepository.findById(item.product.toString());
    if (!productData) {
      return ErrorHandler(res, "PRODUCT_NOT_FOUND", 404);
    }

    if (productData.stock < item.quantity) {
      return ErrorHandler(res, "INSUFFICIENT_STOCK", 400);
    }

    const itemTotal = productData.price * item.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      product: item.product,
      quantity: item.quantity,
      price: productData.price,
    });

    historyItems.push({
      paid: itemTotal,
      item: new Types.ObjectId(item.product.toString()),
      timestamp: new Date(),
      transactionHash: transactionHash || new Types.ObjectId().toString(),
    });

    stockUpdates.push({
      id: item.product.toString(),
      quantity: item.quantity,
    });
  }

  try {

    const order = await OrderRepository.create({
      buyer: new Types.ObjectId(userId),
      items: orderItems,
      totalAmount,
      status: IOrderStatus.PENDING,
      payment: {
        amount: totalAmount,
        txHash: transactionHash || new Types.ObjectId().toString(),
      },
    });


    await Promise.all(
      stockUpdates.map((update) =>
        ProductRepository.updateById(update.id, {
          $inc: { stock: -update.quantity },
        })
      )
    );


    await UserRepository.updateById(userId, {
      $push: {
        history: {
          $each: historyItems,
        },
      },
    });

    if (cart) {

      await CartRepository.deleteById(String(cart._id));

    }

    ResponseHandler(res, 200, "Checkout successful", {
      orderId: order._id,
      totalAmount,
      transactionHash,
    });
  } catch (error) {
    // return AppError(error, res);
    console.log(error)
  }
});

