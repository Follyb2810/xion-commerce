"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("./product.controller");
const auth_1 = require("./../../middleware/auth");
const multer_1 = __importDefault(require("./../../common/libs/multer"));
const checkCache_1 = __importDefault(require("../../middleware/checkCache"));
const cache_1 = require("../../common/libs/cache");
const checkProductsCache_1 = require("../../middleware/checkProductsCache");
const router = express_1.default.Router();
router.get("/test", (0, checkCache_1.default)(() => "test-key"), (req, res) => {
    const data = [
        { id: 1, name: "Product A" },
        { id: 2, name: "Product B" },
    ];
    if (req.cacheKey) {
        cache_1.cache.set(req.cacheKey, data, 60);
    }
    res.json({ message: data });
});
// /api/products/filter?category=683c4a3cff2be395333cc06b&isBestDeal=true&page=2&limit=20
//? /api/products?page=2&limit=10
router.get("/", 
//   checkCache((req) => `products-${req.query.page || 1}`),
checkProductsCache_1.checkProductsCache, product_controller_1.allProducts);
router.get("/seller_product", auth_1.auth, (0, checkCache_1.default)((req) => `products-${req._id}`), product_controller_1.allSellerProduct);
router.get("/:productId", (0, checkCache_1.default)((req) => `products-${req.params.productId}`), product_controller_1.getProductById);
router.post("/", auth_1.auth, multer_1.default.uploadProductFiles(), product_controller_1.createProduct);
router.put("/:productId", auth_1.auth, product_controller_1.updateProduct);
router.put("/:productId", auth_1.auth, multer_1.default.uploadSingle("image_of_land"), product_controller_1.updateProductImage);
router.put("/:productId", auth_1.auth, multer_1.default.uploadSingle("document_of_land"), product_controller_1.updateProductDocument);
router.delete("/:productId", auth_1.auth, product_controller_1.deleteProduct);
exports.default = router;
