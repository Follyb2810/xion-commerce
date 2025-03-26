import { IProduct } from "../types/IProduct";
import { IUser } from "../types/IUser";

export const formatProductResponse = (product: IProduct, seller: IUser, quantity: number) => {
  console.log(product)
  console.log(seller)
  console.log(quantity)
  return {
    productId: product._id,
    quantity,
    price: product.price,
    totalAmount: product.price * quantity,
    seller: seller._id,
    sellerAddress: seller.walletAddress
  };
};