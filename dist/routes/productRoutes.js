"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("../utils/multer"));
const router = express_1.default.Router();
//? /api/products?page=2&limit=10
router.get('/', productController_1.allProducts);
router.get('/seller_product', auth_1.auth, productController_1.allSellerProduct);
router.get('/:productId', productController_1.getProductById);
// router.get('/:productId',auth, getProductById);
router.post('/', auth_1.auth, multer_1.default.uploadProductFiles(), productController_1.createProduct);
router.put('/:productId', auth_1.auth, productController_1.updateProduct);
// router.put('/:productId', auth, MulterService.uploadProductFiles(), updateProduct);
router.put('/:productId', auth_1.auth, multer_1.default.uploadSingle('image_of_land'), productController_1.updateProductImage);
router.put('/:productId', auth_1.auth, multer_1.default.uploadSingle('document_of_land'), productController_1.updateProductDocument);
router.delete('/:productId', auth_1.auth, productController_1.deleteProduct);
exports.default = router;
