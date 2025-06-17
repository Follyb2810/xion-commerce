import express from "express";
import {
  allProducts,
  allSellerProduct,
  createProduct,
  deleteProduct,
  getProductById,
  updateProduct,
  updateProductDocument,
  updateProductImage,
} from "./product.controller";
import { auth } from "./../../middleware/auth";
import MulterService from "./../../common/libs/multer";
import checkCache, { CacheRequest } from "../../middleware/checkCache";
import { cache } from "../../common/libs/cache";
import { checkProductsCache } from "../../middleware/checkProductsCache";

const router = express.Router();

router.get(
  "/test",
  checkCache(() => "test-key"),
  (req: CacheRequest, res) => {
    const data = [
      { id: 1, name: "Product A" },
      { id: 2, name: "Product B" },
    ];

    if (req.cacheKey) {
      cache.set(req.cacheKey, data, 60);
    }

    res.json({ message: data });
  }
);
// /api/products/filter?category=683c4a3cff2be395333cc06b&isBestDeal=true&page=2&limit=20
//? /api/products?page=2&limit=10

router.get(
  "/",
  //   checkCache((req) => `products-${req.query.page || 1}`),
  checkProductsCache,
  allProducts
);

router.get(
  "/seller_product",
  auth,
  checkCache((req) => `products-${req._id}`),
  allSellerProduct
);
router.get(
  "/:productId",
  checkCache((req) => `products-${req.params.productId}`),
  getProductById
);

router.post("/", auth, MulterService.uploadProductFiles(), createProduct);
router.put("/:productId", auth, updateProduct);
router.put(
  "/:productId",
  auth,
  MulterService.uploadSingle("image_of_land"),
  updateProductImage
);
router.put(
  "/:productId",
  auth,
  MulterService.uploadSingle("document_of_land"),
  updateProductDocument
);
router.delete("/:productId", auth, deleteProduct);

export default router;
