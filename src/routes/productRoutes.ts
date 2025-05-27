import express from 'express';
import { allProducts, allSellerProduct, createProduct, deleteProduct, getProductById, updateProduct, updateProductDocument, updateProductImage } from '../controllers/productController';
import { auth } from '../middleware/auth';
import MulterService from '../utils/multer';

const router = express.Router();

//? /api/products?page=2&limit=10
router.get('/', allProducts);
router.get('/seller_product', auth,allSellerProduct);
router.get('/:productId', getProductById);
// router.get('/:productId',auth, getProductById);

router.post('/', auth,MulterService.uploadProductFiles(), createProduct);
router.put('/:productId', auth, updateProduct);
// router.put('/:productId', auth, MulterService.uploadProductFiles(), updateProduct);
router.put('/:productId', auth, MulterService.uploadSingle('image_of_land'), updateProductImage);
router.put('/:productId', auth, MulterService.uploadSingle('document_of_land'), updateProductDocument);
router.delete('/:productId', auth, deleteProduct);

export default router;
