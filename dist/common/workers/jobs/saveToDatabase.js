"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveTransaction = void 0;
exports.default = saveToDatabase;
const product_model_1 = __importDefault(require("../../../features/product/product.model"));
const order_model_1 = __importDefault(require("../../../features/order/order.model"));
const cart_model_1 = __importDefault(require("../../../features/cart/cart.model"));
const saveTransaction = (SchemaType, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const savedToDb = yield SchemaType.create(data);
        return savedToDb;
    }
    catch (error) {
        throw error;
    }
});
exports.saveTransaction = saveTransaction;
const modelMap = {
    Product: product_model_1.default,
    Order: order_model_1.default,
    Cart: cart_model_1.default,
};
function saveToDatabase(_a) {
    return __awaiter(this, arguments, void 0, function* ({ modelName, payload }) {
        const model = modelMap[modelName];
        if (!model)
            throw new Error(`Model "${modelName}" not found.`);
        const result = yield (0, exports.saveTransaction)(model, payload);
        return result;
    });
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
