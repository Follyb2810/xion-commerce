import { Request, Response } from "express";
import AsyncHandler from "express-async-handler";

import { AuthRequest } from "../middleware/auth";
import { ResponseHandler, ErrorHandler } from "../utils/ResponseHandler";
import { Types } from "mongoose";
import UserRepository from "../repositories/UserRepository";
import ProductRepository from "../repositories/ProductRepository";
import OrderRepository from "../repositories/OrderRepository";
import { IUser } from "../types/IUser";
import { OrderStatus } from "../types/IOrder";
import CartRepository from "../repositories/CartRepository";
import { formatProductResponse } from "../middleware/ProductResponse";
import { ProductAuth } from "../middleware/CheckStock";
import { XionRequest } from "./xionController";



//!
export const allOrder = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const all = await OrderRepository.getAll()
  res.json(all)
})
export const updateOrderStatus = AsyncHandler(async (req: XionRequest, res: Response) => {
  const { orderId } = req.params;
  let { status } = req.body;

  if (!orderId || !status) {
      return ResponseHandler(res, 400, "Order ID and status are required.");
  }

  status = status.toLowerCase();

  const validStatuses = Object.values(OrderStatus).map(s => s.toLowerCase());
  if (!validStatuses.includes(status)) {
    return ResponseHandler(res, 400, "Invalid status.");
  }
  
  const order = await OrderRepository.findById(orderId);
  if (!order) {
    return ResponseHandler(res, 404, "Order not found.");
  }
  
  if (status === OrderStatus.CANCELED) {
    for (const item of order.items) {
      await ProductRepository.updateById(item.product.toString(), { $inc: { stock: item.quantity } });
    }
  }
  
  const updatedOrder = await OrderRepository.updateById(orderId, { status });
  
  const responsePayload = {
    updatedOrder,
    escrowTransaction: req.transactionData, 
  };

    ResponseHandler(res, 200, "Order status updated",responsePayload);
});

// export const updateOrderStatus = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
//   const { orderId } = req.params;
//   let { status } = req.body;

//   status = status.toLowerCase(); 

//   const validStatuses = Object.values(OrderStatus).map(s => s.toLowerCase());
//   if (!validStatuses.includes(status)) {
//     return ErrorHandler(res, "INVALID_STATUS", 400);
//   }

//   const order = await OrderRepository.findById(orderId);
//   if (!order) {
//     return ErrorHandler(res, "ORDER_NOT_FOUND", 404);
//   }

//   if (status === OrderStatus.CANCELED) {
//     for (const item of order.items) {
//       await ProductRepository.updateById(item.product.toString(), { $inc: { stock: item.quantity } });
//     }
//   }

//   const updatedOrder = await OrderRepository.updateById(orderId, { status });
//   ResponseHandler(res, 200, "Order status updated", updatedOrder);
// });
 //! 
  export const getDirectPurchaseHistory = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req._id;
  
    const user = await UserRepository.findById(userId!, "history.item");
    if (!user) {
      return ErrorHandler(res, "USER_NOT_FOUND", 404);
    }
  
    ResponseHandler(res, 200, "History of Purchase", user?.history || []);
  });
  
  //!
  export const getUserOrder = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req._id;
  
    const orders = await OrderRepository.findByEntity(
      { $or: [{ buyer: userId }, { seller: userId }] },
      "buyer seller items status totalAmount createdAt updatedAt"
    );
    if (!orders) {
      return ErrorHandler(res, "ORDER_NOT_FOUND", 404);
    }
  

    if (String(orders.buyer) !== String(userId)) {
      return ErrorHandler(res, "UNAUTHORIZED", 403);
    }

  
    ResponseHandler(res, 200, "Purchase details retrieved", orders);
  });
  //! 
export const checkProductAvailability = AsyncHandler(async (req: ProductAuth, res: Response): Promise<void> => {
      const { quantity } = req.body;
    const { product, seller } = req;

  ResponseHandler(res, 200, "Product available", formatProductResponse(product,seller!,quantity));
  
});

//! 
export const confirmDirectPurchase = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req._id;
  const { productId, quantity = 1, transactionHash } = req.body;

if (!Types.ObjectId.isValid(productId)) {
  console.error('INVALID_PRODUCT_ID','confirmDirectPurchase transactionHash')
  return ErrorHandler(res, "INVALID_PRODUCT_ID", 400);
}

if (!transactionHash) {
  console.error('TRANSACTION_HASH_REQUIRED','confirmDirectPurchase transactionHash')
  return ErrorHandler(res, "TRANSACTION_HASH_REQUIRED", 400);
}

const product = await ProductRepository.findById(productId);
if (!product) {
  return ErrorHandler(res, "PRODUCT_NOT_FOUND", 404);
}
// console.error(product,'confirmDirectPurchase product')

if (product.stock < quantity) {
  console.error(`${product.stock } - ${quantity}`,'confirmDirectPurchase product')
  return ErrorHandler(res, "INSUFFICIENT_STOCK", 400);
}

const totalAmount = product.price * quantity;

  try {
    const order = await OrderRepository.create({
      buyer: new Types.ObjectId(userId),
      seller: product.seller,
      items: [
        {
          product: new Types.ObjectId(productId),
          quantity: quantity,
          price: product.price,
        },
      ],
      totalAmount: totalAmount,
      payment: {
        amount: totalAmount,
        txHash: transactionHash
      },
      status: OrderStatus.PENDING
    });


    await ProductRepository.updateById(productId, {
      $inc: { stock: -quantity }
    });
    
    let cart = await CartRepository.findByEntity({ user: new Types.ObjectId(userId) });
    if (cart) {
      const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
      if (itemIndex !== -1) {
        const productItem = cart.items[itemIndex];
        if (quantity === productItem.quantity) {
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].quantity -= quantity;
        }
      
        cart.total = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
        await cart.save();
      }
    }

    await UserRepository.updateById(userId!, {
      $push: {
        history: {
          paid: totalAmount,
          item: new Types.ObjectId(productId),
          timestamp: new Date(),
          transactionHash,
          orderId: order._id
        }
      }
    });
    ResponseHandler(res, 201, "Purchase successful", {
      order,
      transactionHash,
      updatedStock: product.stock - quantity,
      product: {
        title: product.title,
        price: product.price
      }
    });
  } catch (error) {
    console.error("Direct purchase error:", error);
    return ErrorHandler(res, "PURCHASE_FAILED", 500);
  }
});

export const getUserPurchaseHistory = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req._id;
  const { status } = req.query; 

  const filter: Record<string, any> = { buyer: userId };
  if (status) {
    filter.status = status;
  }

  const orders = await OrderRepository.getAll(
    undefined,
    filter,
    [
      {
        path: "items.product",
        select: "price image_of_land stock",
      },
    ]
  );

  ResponseHandler(res, 200, "User purchase history retrieved", orders);
});


