"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
exports.cache = new node_cache_1.default({ stdTTL: 60, checkperiod: 120 });
// router.get(
//   '/:productId',
//   checkCache((req) => `product:${req.params.productId}`),
//   getProductById
// );
// cache.del(key);
// cache.flushAll();
//  cache.set(key, data);
// import { cache } from '../utils/cache';
// export const getProductById = async (req: AuthRequest, res: Response) => {
//   try {
//     const product = await Product.findById(req.params.productId);
//     if (!product) return res.status(404).json({ message: 'Product not found' });
//     if (req.cacheKey) {
//       cache.set(req.cacheKey, product, 60); // cache for 60s
//     }
//     res.status(200).json({ source: 'api', data: product });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// import { cache } from '../utils/cache';
// export const updateProduct = async (req: AuthRequest, res: Response) => {
//   try {
//     const updatedProduct = await Product.findByIdAndUpdate(
//       req.params.productId,
//       req.body,
//       { new: true }
//     );
//     if (!updatedProduct) {
//       return res.status(404).json({ message: 'Product not found' });
//     }
//     // Invalidate product cache
//     cache.del(`product:${req.params.productId}`);
//     cache.flushAll(); // Optionally flush all cache if necessary
//     res.status(200).json({ message: 'Product updated', data: updatedProduct });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// checkCache((req) => `product:${req.params.productId}`)
// import { cache } from '../utils/cache';
// export const updateProduct = async (req: AuthRequest, res: Response) => {
//   try {
//     const updatedProduct = await Product.findByIdAndUpdate(
//       req.params.productId,
//       req.body,
//       { new: true }
//     );
//     if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
//     // Invalidate product cache
//     cache.del(`product:${req.params.productId}`);
//     cache.del('products:list'); // Invalidate product list if applicable
//     res.status(200).json({ message: 'Product updated', data: updatedProduct });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// cache.set('products:page=1', data);
// cache.keys().forEach((key) => {
//   if (key.startsWith('products:')) {
//     cache.del(key);
//   }
// });
// export const deleteProduct = async (req: AuthRequest, res: Response) => {
//   try {
//     const deleted = await Product.findByIdAndDelete(req.params.productId);
//     if (!deleted) return res.status(404).json({ message: 'Product not found' });
//     // Invalidate relevant cache
//     cache.del(`product:${req.params.productId}`);
//     cache.del('products:list');
//     res.status(200).json({ message: 'Product deleted' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// export const createProduct = async (req: AuthRequest, res: Response) => {
//   try {
//     const newProduct = new Product(req.body);
//     await newProduct.save();
//     // Invalidate product list cache
//     cache.del('products:list');
//     res.status(201).json({ message: 'Product created', data: newProduct });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// export const createProduct = async (req: AuthRequest, res: Response) => {
//   try {
//     const newProduct = await Product.create(req.body);
//     // Invalidate product list cache
//     cache.keys().forEach((key) => {
//       if (key.startsWith('/api/products')) {
//         cache.del(key);
//       }
//     });
//     res.status(201).json({ message: 'Product created', data: newProduct });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// export const deleteProduct = async (req: AuthRequest, res: Response) => {
//   try {
//     const deleted = await Product.findByIdAndDelete(req.params.productId);
//     if (!deleted) {
//       return res.status(404).json({ message: 'Product not found' });
//     }
//     cache.del(`product:${req.params.productId}`);
//     cache.keys().forEach((key) => {
//       if (key.startsWith('/api/products')) {
//         cache.del(key);
//       }
//     });
//     res.status(200).json({ message: 'Product deleted' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
