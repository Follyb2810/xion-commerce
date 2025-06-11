"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("./product.controller");
const auth_1 = require("./../../middleware/auth");
const multer_1 = __importDefault(require("./../../common/libs/multer"));
const router = express_1.default.Router();
//? /api/products?page=2&limit=10
router.get('/', product_controller_1.allProducts); // /api/products/filter?category=683c4a3cff2be395333cc06b&isBestDeal=true&page=2&limit=20
router.get('/seller_product', auth_1.auth, product_controller_1.allSellerProduct);
router.get('/:productId', product_controller_1.getProductById);
router.post('/', auth_1.auth, multer_1.default.uploadProductFiles(), product_controller_1.createProduct);
router.put('/:productId', auth_1.auth, product_controller_1.updateProduct);
// router.put('/:productId', auth, MulterService.uploadProductFiles(), updateProduct);
router.put('/:productId', auth_1.auth, multer_1.default.uploadSingle('image_of_land'), product_controller_1.updateProductImage);
router.put('/:productId', auth_1.auth, multer_1.default.uploadSingle('document_of_land'), product_controller_1.updateProductDocument);
router.delete('/:productId', auth_1.auth, product_controller_1.deleteProduct);
exports.default = router;
