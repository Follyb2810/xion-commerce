import { Document, Model } from "mongoose";
import ProductModel from "../../../features/product/product.model";
import OrderModel from "../../../features/order/order.model";
import CartModel from "../../../features/cart/cart.model";

export const saveTransaction = async <T extends Document>(
  SchemaType: Model<T>,
  data: Partial<T>
): Promise<T> => {
  try {
    const savedToDb = await SchemaType.create(data);
    return savedToDb;
  } catch (error) {
    throw error;
  }
};

const modelMap: Record<string, any> = {
  Product: ProductModel,
  Order: OrderModel,
  Cart: CartModel,
};

interface SaveJob {
  modelName: string;
  payload: any;
}

export default async function saveToDatabase({ modelName, payload }: SaveJob) {
  const model = modelMap[modelName];
  if (!model) throw new Error(`Model "${modelName}" not found.`);

  const result = await saveTransaction(model, payload);
  return result;
}

// await handleJob({
//   type: 'saveToDatabase',
//   data: {
//     modelName: 'Product',
//     payload: {
//       name: 'T-Shirt',
//       price: 50,
//       quantity: 10
//     }
//   }
// });

// await handleJob({
//   type: 'saveToDatabase',
//   data: {
//     modelName: 'Order',
//     payload: {
//       userId: '12345',
//       total: 300,
//       items: [{ productId: 'p1', quantity: 2 }]
//     }
//   }
// });

