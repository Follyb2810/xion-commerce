import { Request, Response } from "express";
import AsyncHandler from "express-async-handler";
import { AuthRequest } from "./../../middleware/auth";
import { Roles } from "./../../common/types/IUser";
import { ErrorHandler, ResponseHandler } from "./../../common/exceptions/ResponseHandler";
import ProductService from "./product.service";

export const allProducts = AsyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await ProductService.getAllProducts(req.query);
    return ResponseHandler(res, 200, "Products retrieved successfully", result);
  } catch (error: any) {
    console.error("Get all products error:", error);
    
    if (error.message === "INVALID_CATEGORY_ID") {
      return ErrorHandler(res, "Invalid category ID", 400);
    }
    
    return ErrorHandler(res, "FAILED_TO_FETCH_PRODUCTS", 500);
  }
});

export const getProductById = AsyncHandler(async (req: Request, res: Response) => {
  try {
    const product = await ProductService.getProductById(req.params.productId);
    return ResponseHandler(res, 200, "Product retrieved successfully", { product });
  } catch (error: any) {
    console.error("Get product by ID error:", error);
    
    if (error.message === "PRODUCT_NOT_FOUND") {
      return ErrorHandler(res, "PRODUCT_NOT_FOUND", 404);
    }
    
    return ErrorHandler(res, "FAILED_TO_FETCH_PRODUCT", 500);
  }
});

export const createProduct = AsyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    if (!req.roles?.includes(Roles.SELLER)) {
      return ErrorHandler(res, "SELLER_AUTH", 403);
    }

    if (!req.files) {
      return ErrorHandler(res, "FILE_ERROR", 400);
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const productData = {
      ...req.body,
      sellerId: req._id!,
    };

    const newProduct = await ProductService.createProduct(productData, files);
    return ResponseHandler(res, 201, "Product uploaded successfully", { product: newProduct });
  } catch (error: any) {
    console.error("Create product error:", error);
    
    if (error.message === "COVER_IMAGE_REQUIRED") {
      return ErrorHandler(res, "Cover image is required", 400);
    }
    if (error.message === "INVALID_IMAGE_COUNT") {
      return ErrorHandler(res, "You must upload between 1 and 5 images of the land", 400);
    }
    if (error.message === "INVALID_DOCUMENT_COUNT") {
      return ErrorHandler(res, "You must upload between 1 and 6 document files", 400);
    }
    
    return ErrorHandler(res, "FAILED_TO_CREATE_PRODUCT", 500);
  }
});

export const deleteProduct = AsyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    await ProductService.deleteProduct(productId, req._id!);
    return ResponseHandler(res, 200, "Product deleted successfully");
  } catch (error: any) {
    console.error("Delete product error:", error);
    
    if (error.message === "PRODUCT_NOT_FOUND") {
      return ErrorHandler(res, "PRODUCT_NOT_FOUND", 404);
    }
    if (error.message === "UNAUTHORIZED") {
      return ErrorHandler(res, "UNAUTHORIZED", 403);
    }
    
    return ErrorHandler(res, "FAILED_TO_DELETE_PRODUCT", 500);
  }
});

export const updateProduct = AsyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const updatedProduct = await ProductService.updateProduct(
      req.params.productId,
      req._id!,
      req.body
    );
    return ResponseHandler(res, 200, "Product updated successfully", { updatedProduct });
  } catch (error: any) {
    console.error("Update product error:", error);
    
    if (error.message === "PRODUCT_NOT_FOUND") {
      return ErrorHandler(res, "PRODUCT_NOT_FOUND", 404);
    }
    if (error.message === "UNAUTHORIZED") {
      return ErrorHandler(res, "Unauthorized", 401);
    }
    if (error.message === "INVALID_MAP_LOCATION") {
      return ErrorHandler(res, "INVALID_MAP_LOCATION", 400);
    }
    
    return ErrorHandler(res, "FAILED_TO_UPDATE_PRODUCT", 500);
  }
});

export const updateProductImage = AsyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const imageFiles = files?.image_of_land || [];

    await ProductService.updateProductImage(req.params.productId, req._id!, imageFiles);
    return ResponseHandler(res, 200, "Image(s) updated successfully");
  } catch (error: any) {
    console.error("Update product image error:", error);
    
    if (error.message === "PRODUCT_NOT_FOUND") {
      return ErrorHandler(res, "PRODUCT_NOT_FOUND", 404);
    }
    if (error.message === "UNAUTHORIZED") {
      return ErrorHandler(res, "Unauthorized", 403);
    }
    if (error.message === "NO_IMAGE_FILES") {
      return ErrorHandler(res, "No image file(s) uploaded", 400);
    }
    if (error.message === "IMAGE_LIMIT_EXCEEDED") {
      return ErrorHandler(res, "You can only have a maximum of 5 images", 400);
    }
    
    return ErrorHandler(res, "FAILED_TO_UPDATE_IMAGES", 500);
  }
});

export const deleteProductImage = AsyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { imageUrl } = req.query;

    await ProductService.deleteProductImage(productId, req._id!, imageUrl as string);
    return ResponseHandler(res, 200, "Image deleted successfully");
  } catch (error: any) {
    console.error("Delete product image error:", error);
    
    if (error.message === "IMAGE_URL_REQUIRED") {
      return ErrorHandler(res, "Missing or invalid imageUrl", 400);
    }
    if (error.message === "PRODUCT_NOT_FOUND") {
      return ErrorHandler(res, "PRODUCT_NOT_FOUND", 404);
    }
    if (error.message === "UNAUTHORIZED") {
      return ErrorHandler(res, "Unauthorized", 403);
    }
    if (error.message === "IMAGE_NOT_FOUND") {
      return ErrorHandler(res, "Image not found in product", 400);
    }
    if (error.message === "CANNOT_DELETE_ONLY_IMAGE") {
      return ErrorHandler(res, "Cannot delete the only image. At least one image is required.", 400);
    }
    if (error.message === "FAILED_TO_EXTRACT_PUBLIC_ID") {
      return ErrorHandler(res, "Failed to extract public ID", 500);
    }
    
    return ErrorHandler(res, "FAILED_TO_DELETE_IMAGE", 500);
  }
});

export const updateProductDocument = AsyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const documentFile = files?.document_of_land?.[0];

    if (!documentFile) {
      return ErrorHandler(res, "No document file uploaded", 400);
    }

    await ProductService.updateProductDocument(req.params.productId, req._id!, documentFile);
    return ResponseHandler(res, 204, "Document updated successfully");
  } catch (error: any) {
    console.error("Update product document error:", error);
    
    if (error.message === "PRODUCT_NOT_FOUND") {
      return ErrorHandler(res, "PRODUCT_NOT_FOUND", 404);
    }
    if (error.message === "UNAUTHORIZED") {
      return ErrorHandler(res, "Unauthorized", 403);
    }
    if (error.message === "NO_DOCUMENT_FILE") {
      return ErrorHandler(res, "INVALID_FILE", 400);
    }
    
    return ErrorHandler(res, "FAILED_TO_UPDATE_DOCUMENT", 500);
  }
});

export const allSellerProduct = AsyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const products = await ProductService.getSellerProducts(req._id!);
    return ResponseHandler(res, 200, "All seller products retrieved successfully", { products });
  } catch (error) {
    console.error("Get seller products error:", error);
    return ErrorHandler(res, "FAILED_TO_FETCH_SELLER_PRODUCTS", 500);
  }
});

export const getSpecialOffers = AsyncHandler(async (req: Request, res: Response) => {
  try {
    const products = await ProductService.getSpecialOffers();
    return ResponseHandler(res, 200, "Special offers fetched", { products });
  } catch (error) {
    console.error("Get special offers error:", error);
    return ErrorHandler(res, "FAILED_TO_FETCH_SPECIAL_OFFERS", 500);
  }
});

export const getBestDeals = AsyncHandler(async (req: Request, res: Response) => {
  try {
    const products = await ProductService.getBestDeals();
    return ResponseHandler(res, 200, "Best deals fetched", { products });
  } catch (error) {
    console.error("Get best deals error:", error);
    return ErrorHandler(res, "FAILED_TO_FETCH_BEST_DEALS", 500);
  }
});

export const getTopSelling = AsyncHandler(async (req: Request, res: Response) => {
  try {
    const products = await ProductService.getTopSelling();
    return ResponseHandler(res, 200, "Top selling properties fetched", { products });
  } catch (error) {
    console.error("Get top selling error:", error);
    return ErrorHandler(res, "FAILED_TO_FETCH_TOP_SELLING", 500);
  }
});

export const getProductByCategory = AsyncHandler(async (req: Request, res: Response) => {
  try {
    const rawCategory = req.query.category;
    const category = typeof rawCategory === "string" ? rawCategory : Array.isArray(rawCategory) ? rawCategory[0] : "";

    const products = await ProductService.getProductsByCategory(category as string);
    return ResponseHandler(res, 200, "Product by category", products);
  } catch (error: any) {
    console.error("Get products by category error:", error);
    
    if (error.message === "INVALID_CATEGORY_ID") {
      return ErrorHandler(res, "Invalid category ID", 400);
    }
    
    return ErrorHandler(res, "FAILED_TO_FETCH_PRODUCTS_BY_CATEGORY", 500);
  }
});