import { Types } from "mongoose";
import CartRepository from "./cart.repository";
import ProductRepository from "./../product/product.repository";
import UserRepository from "./../user/user.repository";
import OrderRepository from "./../order/order.repository";
import { OrderStatus as IOrderStatus } from "./../../common/types/IOrder";
import { IUser } from "./../../common/types/IUser";

class CartService {
  async addProductToCart(
    userId: string,
    productId: string,
    quantity: number = 1
  ) {
    const productData = await ProductRepository.findById(productId);
    if (!productData) {
      throw new Error("NOT_FOUND");
    }

    if (quantity <= 0) {
      throw new Error("INVALID_QUANTITY");
    }

    if (productData.stock < quantity) {
      throw new Error("INSUFFICIENT_STOCK");
    }

    let cart = await CartRepository.findByEntity({
      user: new Types.ObjectId(userId),
    });

    if (!cart) {
      cart = await CartRepository.create({
        user: new Types.ObjectId(userId),
        items: [
          {
            product: new Types.ObjectId(productId),
            quantity,
            price: productData.price,
          },
        ],
        total: productData.price * quantity,
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({
          product: new Types.ObjectId(productId),
          quantity,
          price: productData.price,
        });
      }

      cart.total = cart.items.reduce(
        (acc, item) => acc + item.quantity * item.price,
        0
      );
      await cart.save();
    }

    return cart;
  }

  async getUserCart(userId: string) {
    const cart = await CartRepository.findByEntity(
      { user: userId },
      undefined,
      "items.product"
    );
    return cart;
  }

  async removeProductFromCart(
    userId: string,
    productId: string,
    quantity: number = 1
  ) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new Error("FIELD_ERROR");
    }

    const cart = await CartRepository.findByEntity({
      user: new Types.ObjectId(userId),
    });

    if (!cart) {
      throw new Error("NOT_FOUND");
    }

    if (String(userId) !== String(cart.user._id)) {
      throw new Error("UNAUTHORIZED");
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      throw new Error("NOT_FOUND");
    }

    if (quantity >= cart.items[itemIndex].quantity) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity -= quantity;
    }

    cart.total = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );
    await cart.save();

    return cart;
  }

  async deleteCart(userId: string, cartId: string) {
    const userCart = await CartRepository.findById(cartId);

    if (!userCart) {
      throw new Error("NOT_FOUND");
    }

    if (String(userId) !== String(userCart.user._id)) {
      throw new Error("UNAUTHORIZED");
    }

    await CartRepository.deleteById(cartId);
    return true;
  }

  async validateProductAvailability(productId: string, quantity: number) {
    const productData = await ProductRepository.findById(productId);

    if (!productData) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    if (productData.stock < quantity) {
      throw new Error("INSUFFICIENT_STOCK");
    }

    return { product: productData, available: true };
  }

  async processCheckout(userId: string, transactionHash?: string) {
    if (!userId) {
      throw new Error("USER_NOT_FOUND");
    }

    const cart = await CartRepository.findByEntity(
      { user: userId },
      undefined,
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      throw new Error("EMPTY_CART");
    }

    let totalAmount = 0;
    const orderItems = [];
    const historyItems = [];
    const stockUpdates = [];

    for (const item of cart.items) {
      const productData = await ProductRepository.findById(
        item.product.toString()
      );

      if (!productData) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      if (productData.stock < item.quantity) {
        throw new Error("INSUFFICIENT_STOCK");
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

      return {
        orderId: order._id,
        totalAmount,
        transactionHash: transactionHash || new Types.ObjectId().toString(),
      };
    } catch (error) {
      console.error("Checkout error:", error);
      throw new Error("CHECKOUT_FAILED");
    }
  }
}

export default new CartService();
