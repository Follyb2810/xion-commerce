import express from 'express';
import { allProducts, allSellerProduct, createProduct, deleteProduct, getProductById, updateProduct, updateProductDocument, updateProductImage } from '../controllers/productController';
import { auth } from '../middleware/auth';
import MulterService from '../utils/multer';

const router = express.Router();

//? /api/products?page=2&limit=10
router.get('/', allProducts); // /api/products/filter?category=683c4a3cff2be395333cc06b&isBestDeal=true&page=2&limit=20
router.get('/seller_product', auth,allSellerProduct);
router.get('/:productId', getProductById);


router.post('/', auth,MulterService.uploadProductFiles(), createProduct);
router.put('/:productId', auth, updateProduct);
// router.put('/:productId', auth, MulterService.uploadProductFiles(), updateProduct);
router.put('/:productId', auth, MulterService.uploadSingle('image_of_land'), updateProductImage);
router.put('/:productId', auth, MulterService.uploadSingle('document_of_land'), updateProductDocument);
router.delete('/:productId', auth, deleteProduct);

export default router;
