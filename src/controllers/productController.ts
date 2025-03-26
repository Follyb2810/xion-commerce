import { Request, Response } from "express";
import AsyncHandler from "express-async-handler";
import { AuthRequest } from "../middleware/auth";
import { Roles } from "../types/IUser";
import { Types } from "mongoose";
import CloudinaryService from "../utils/claudinary";
import { IProduct } from "../types/IProduct";
import { ErrorHandler, ResponseHandler } from "../utils/ResponseHandler";
import ProductRepository from "../repositories/ProductRepository";

export const allProducts = AsyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit; 

    const products = await ProductRepository.getAll(
        undefined, 
        { stock: { $gt: 0 } }, 
        [{ path: "seller", select: "walletAddress" }],
        limit, 
        skip
    );
    
    const totalItems = await ProductRepository.countDocuments({ stock: { $gt: 0 } });
    const totalPages = Math.ceil(totalItems / limit);

    return ResponseHandler(res, 200, "All products retrieved successfully", { 
        products, 
        pagination: { page, limit, totalPages, totalItems }
    });
});

// export const allProducts = AsyncHandler(async (req: Request, res: Response) => {
//     const products = await ProductRepository.getAll(undefined,  { stock: { $gt: 0 } }, [{ path: "seller", select: "walletAddress" }]);
//     // const products = await ProductRepository.getAll(undefined, {}, [{ path: "seller", select: "walletAddress" }]);
//     return ResponseHandler(res, 200,"All products retrieved successfully", { products });
// });

export const getProductById = AsyncHandler(async (req: Request, res: Response) => {
    const product = await ProductRepository.findById(req.params.productId, [{ path: "seller", select: "walletAddress" }]);
    if (!product) return ErrorHandler(res, "CART_NOT_FOUND",404);
    return ResponseHandler(res, 200,"Product retrieved successfully", { product });
});

export const createProduct = AsyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.roles?.includes(Roles.SELLER)) return ErrorHandler(res, "SELLER_AUTH",403);
    
    if (!req.files) return ErrorHandler(res, "FILE_ERROR",400);
    
    const { title, description, price, category, stock, address, mapping_location, size_of_land } = req.body;
    
    const mappingLocation = JSON.parse(mapping_location);
    console.log(mappingLocation.lat, mappingLocation.lng);

    if (!mappingLocation || !mappingLocation.lat || !mappingLocation.lng) {
        return ErrorHandler(res, "MAP_LOCATION", 400);
    }
     
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files.image_of_land || !files.document_of_land) return ErrorHandler(res, "Files are missing",400);
    
    const imageUpload = files.image_of_land ? await CloudinaryService.uploadSingleImage(files.image_of_land[0].path) : null;
    const documentUpload = files.document_of_land ? await CloudinaryService.uploadPdfFile(files.document_of_land[0].path) : null;
    
    const newProduct = await ProductRepository.create({
        title,
        description,
        price,
        category,
        seller: new Types.ObjectId(req._id), 
        stock,
        address,
        mapping_location:mappingLocation,
        image_of_land: imageUpload?.secure_url || "",
        size_of_land,
        document_of_land: documentUpload?.secure_url || ""
    });
    await newProduct.save();
    return ResponseHandler(res,201, "Product uploaded successfully", { product: newProduct });
});



export const deleteProduct = AsyncHandler(async (req: AuthRequest, res: Response) => {
    const product = await ProductRepository.findById(req.params.productId, 'seller');
    if (!product) return ErrorHandler(res, "PRODUCT_NOT_FOUND",404);
    console.log(product.seller._id)
    console.log(req._id)
    if (String(product.seller._id) !== String(req._id)) return ErrorHandler(res ,"UNAUTHORIZED",403);
    // if (product.stock > 1) 
    //     return ErrorHandler(res, "PRODUCT_DEL", 400);
    await ProductRepository.deleteById(req.params.productId);
    return ResponseHandler(res,200, "Product deleted successfully");
});

export const updateProduct = AsyncHandler(async (req: AuthRequest, res: Response) => {
    const product = await ProductRepository.findById(req.params.productId, 'seller');
    if (!product) return ErrorHandler(res,"PRODUCT_NOT_FOUND",404);
    if (req.body.mapping_location) {
        const mappingLocation = JSON.parse(req.body.mapping_location);
        console.log(mappingLocation.lat, mappingLocation.lng);
        if (!mappingLocation.lat || !mappingLocation.lng) {
            return ErrorHandler(res, "INVALID_MAP_LOCATION", 400);
        }
    }    
    if (String(product.seller._id) !== String(req._id)) return ErrorHandler(res,"Unauthorized",401);
        const updateData: Partial<IProduct> = { ...req.body };
    const updatedProduct = await ProductRepository.updateById(req.params.productId, updateData);
    return ResponseHandler(res,200, "Product updated successfully", { updatedProduct });
});

export const updateProductImage = AsyncHandler(async (req: AuthRequest, res: Response) => {
    const product = await ProductRepository.findById(req.params.productId, "seller image_of_land");
    if (!product) return ErrorHandler(res, "PRODUCT_NOT_FOUND",404);
    if (String(product.seller._id) !== String(req._id)) return ErrorHandler(res, "Unauthorized",403);
    if (!req.files || typeof req.files !== 'object' || !('image_of_land' in req?.files)) return ErrorHandler(res, "No image file uploaded",400);
    
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const newImagePath = files.image_of_land[0].path;
    const imageUpload = await CloudinaryService.uploadSingleImage(newImagePath);
    if (product.image_of_land) await CloudinaryService.removeSingleImage(product.image_of_land);
    await ProductRepository.updateById(req.params.productId, { image_of_land: imageUpload.secure_url });
    
    return ResponseHandler(res,200, "Image updated successfully");
});

export const updateProductDocument = AsyncHandler(async (req: AuthRequest, res: Response) => {
    const product = await ProductRepository.findById(req.params.productId, "seller document_of_land");
    if (!product) return ErrorHandler(res, "PRODUCT_NOT_FOUND",404);
    if (String(product.seller._id) !== String(req._id)) return ErrorHandler(res,"Unauthorized",403);
    if (!req.files || typeof req.files !== "object" || !("document_of_land" in req.files)) return ErrorHandler(res, "No document file uploaded",400);
    
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const newDocumentPath = files.document_of_land?.[0]?.path;
    if (!newDocumentPath) return ErrorHandler(res, "INVALID_FILE",400);
    
    const documentUpload = await CloudinaryService.uploadPdfFile(newDocumentPath);
    if (product.document_of_land) await CloudinaryService.removeSingleImage(product.document_of_land);
    await ProductRepository.updateById(req.params.productId, { document_of_land: documentUpload.secure_url });
    
    return ResponseHandler(res, 204,"Document updated successfully");
});

export const allSellerProduct = AsyncHandler(async (req: AuthRequest, res: Response) => {
    const products = await ProductRepository.getAll(undefined,{ seller: req._id });
    return ResponseHandler(res, 200, "All seller products retrieved successfully", { products });
});



