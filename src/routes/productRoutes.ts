import express from 'express';
import { allProducts, allSellerProduct, createProduct, deleteProduct, getProductById, updateProduct, updateProductDocument, updateProductImage } from '../controllers/productController';
import { auth } from '../middleware/auth';
import MulterService from '../utils/multer';

const router = express.Router();

//? /api/products?page=2&limit=10
router.get('/', allProducts);
router.get('/seller_product', auth,allSellerProduct);
router.get('/:productId',auth, getProductById);

router.post('/', auth,MulterService.uploadProductFiles(), createProduct);
router.put('/:productId', auth, updateProduct);
// router.put('/:productId', auth, MulterService.uploadProductFiles(), updateProduct);
router.put('/:productId', auth, MulterService.uploadSingle('image_of_land'), updateProductImage);
router.put('/:productId', auth, MulterService.uploadSingle('document_of_land'), updateProductDocument);
router.delete('/:productId', auth, deleteProduct);

export default router;

// "image_of_land": "https://res.cloudinary.com/folly/image/upload/v1741528195/fk90hdo90i1fqaoyhst9.jpg",
// "size_of_land": "150x150",
// "document_of_land": "https://res.cloudinary.com/folly/raw/upload/v1741528196/d16q4iprisklejnmjmsl.pdf",

//?
// "mapping_location": "this is mapping_location",
// "image_of_land": "https://res.cloudinary.com/folly/image/upload/v1741528698/uqba1ge8j3ixb0vfxzdo.jpg",
// "size_of_land": "150x150",
// "document_of_land": "https://res.cloudinary.com/folly/raw/upload/v1741528700/olkes7nhq2ovgouvyjun.pdf",
// "createdAt": "2025-03-09T13:25:10.912Z",