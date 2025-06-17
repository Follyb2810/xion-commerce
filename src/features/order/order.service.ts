import { Types } from "mongoose";
import UserRepository from "./../user/user.repository";
import ProductRepository from "./../product/product.repository";
import OrderRepository from "./../order/order.repository";
import CartRepository from "./../cart/cart.repository";
import { OrderStatus } from "./../../common/types/IOrder";
import { IUser } from "./../../common/types/IUser";

interface DirectPurchaseInput {
  userId: string;
  productId: string;
  quantity: number;
  transactionHash: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  saveDetailsToProfile: boolean;
}

interface OrderDetailsForProfile {
  email: string;
  fullName: string;
  phoneNumber: string;
}

class OrderService {
  async getAllOrder() {
    return await OrderRepository.getAll();
  }

  async updateOrderStatus(orderId: string, status: string) {
    const normalizedStatus = status.toLowerCase();
    
    const validStatuses = Object.values(OrderStatus).map((s) => s.toLowerCase());
    if (!validStatuses.includes(normalizedStatus)) {
      throw new Error("INVALID_STATUS");
    }

    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new Error("ORDER_NOT_FOUND");
    }

    if (normalizedStatus === OrderStatus.CANCELED.toLowerCase()) {
      for (const item of order.items) {
        await ProductRepository.updateById(item.product.toString(), {
          $inc: { stock: item.quantity },
        });
      }
    }

    return await OrderRepository.updateById(orderId, { status: normalizedStatus });
  }

  async getDirectPurchaseHistory(userId: string) {
    const user = await UserRepository.findById(userId, "history.item");
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return user.history || [];
  }

  async getUserOrders(userId: string) {
    const orders = await OrderRepository.findByEntity(
      { $or: [{ buyer: userId }, { seller: userId }] },
      "buyer seller items status totalAmount createdAt updatedAt"
    );
    
    if (!orders) {
      throw new Error("ORDER_NOT_FOUND");
    }

    if (String(orders.buyer) !== String(userId)) {
      throw new Error("UNAUTHORIZED");
    }

    return orders;
  }

  async getUserPurchaseHistory(userId: string, status?: string) {
    const filter: Record<string, any> = { buyer: userId };
    if (status) {
      filter.status = status;
    }

    return await OrderRepository.getAll(undefined, filter, [
      {
        path: "items.product",
        select: "price image_of_land stock coverImage",
      },
    ]);
  }

  async directPurchase(input: DirectPurchaseInput) {
    const {
      userId,
      productId,
      quantity,
      transactionHash,
      email,
      fullName,
      phoneNumber,
      saveDetailsToProfile,
    } = input;

    if (!Types.ObjectId.isValid(productId)) {
      throw new Error("INVALID_PRODUCT_ID");
    }

    if (!transactionHash) {
      throw new Error("TRANSACTION_HASH_REQUIRED");
    }

    const product = await ProductRepository.findById(productId);
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    if (product.stock < quantity) {
      throw new Error("INSUFFICIENT_STOCK");
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
          txHash: transactionHash,
        },
        email,
        fullName,
        phoneNumber,
        status: OrderStatus.PENDING,
      });

      await ProductRepository.updateById(productId, {
        $inc: { stock: -quantity },
      });

      await this.updateCartAfterPurchase(userId, productId, quantity);

      await UserRepository.updateById(userId, {
        $push: {
          history: {
            paid: totalAmount,
            item: new Types.ObjectId(productId),
            timestamp: new Date(),
            transactionHash,
            orderId: order._id,
          },
        },
      });

      // Update user profile if requested
      if (saveDetailsToProfile) {
        await this.updateUserProfileFromOrder(userId, {
          email,
          fullName,
          phoneNumber,
        });
      }

      return {
        order,
        transactionHash,
        updatedStock: product.stock - quantity,
        product: {
          title: product.title,
          price: product.price,
        },
        profileUpdated: saveDetailsToProfile,
      };
    } catch (error) {
      throw new Error("PURCHASE_FAILED" + error);
    }
  }

  private async updateCartAfterPurchase(userId: string, productId: string, quantity: number) {
    const cart = await CartRepository.findByEntity({
      user: new Types.ObjectId(userId),
    });

    if (cart) {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex !== -1) {
        const productItem = cart.items[itemIndex];
        if (quantity === productItem.quantity) {
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].quantity -= quantity;
        }

        cart.total = cart.items.reduce(
          (acc, item) => acc + item.quantity * item.price,
          0
        );
        await cart.save();
      }
    }
  }

  private async updateUserProfileFromOrder(userId: string, orderDetails: OrderDetailsForProfile) {
    try {
      const user = await UserRepository.findById(userId);
      if (!user) return;

      const normalizedEmail = orderDetails.email?.trim().toLowerCase();

      if (normalizedEmail && normalizedEmail !== user.email) {
        const emailTaken = await UserRepository.findByEntity({
          email: normalizedEmail,
        });

        const isEmailUsedByAnotherUser =
          emailTaken && emailTaken._id.toString() !== user._id.toString();

        if (!isEmailUsedByAnotherUser) {
          user.email = normalizedEmail;
          user.isEmailVerified = false;
        }
      }

      if (orderDetails.phoneNumber) {
        user.phoneNumber = orderDetails.phoneNumber;
      }

      if (orderDetails.fullName) {
        user.profile = {
          ...user.profile,
          name: orderDetails.fullName,
        };
      }

      await user.save();
    } catch (error) {
      console.error("Profile update from order failed:", error);
    }
  }
}

export default new OrderService();