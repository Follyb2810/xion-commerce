import { IProduct } from "./../common/types/IProduct";
import { IUser } from "./../common/types/IUser";

export const formatProductResponse = (
  product: IProduct,
  seller: IUser,
  quantity: number
) => {
  return {
    productId: product._id,
    quantity,
    price: product.price,
    totalAmount: product.price * quantity,
    seller: seller._id,
    sellerAddress: seller.walletAddress,
  };
};
