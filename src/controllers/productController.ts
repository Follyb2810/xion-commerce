import { Request, Response } from "express";
import AsyncHandler from "express-async-handler";
import { AuthRequest } from "../middleware/auth";
import { Roles } from "../types/IUser";
import mongoose, { Types } from "mongoose";
import CloudinaryService from "../utils/claudinary";
import { IProduct } from "../types/IProduct";
import { ErrorHandler, ResponseHandler } from "../utils/ResponseHandler";
import ProductRepository from "../repositories/ProductRepository";
import { processImageWithSharp } from "../utils/imageProcessor";

export const allProducts = AsyncHandler(async (req: Request, res: Response) => {
  const {
    category,
    specialOfferPrice,
    isSpecialOffer,
    isBestDeal,
    isTopSelling,
    page = "1",
    limit = "10",
  } = req.query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const query: any = { stock: { $gt: 0 } };


  if (category) {
    const rawCategory =
      typeof category === "string"
        ? category
        : Array.isArray(category)
        ? category[0]
        : "";

    if (!mongoose.Types.ObjectId.isValid(rawCategory as string)) {

      return ErrorHandler(res, "Invalid category ID", 400)
    }

    query.category = rawCategory;
  }

  if (specialOfferPrice) {
    const price = Number(specialOfferPrice);
    if (!isNaN(price)) {
      query.specialOfferPrice = { $lte: price };
    }
  }

  if (isSpecialOffer !== undefined) {
    query.isSpecialOffer = isSpecialOffer === "true";
  }

  if (isBestDeal !== undefined) {
    query.isBestDeal = isBestDeal === "true";
  }

  if (isTopSelling !== undefined) {
    query.isTopSelling = isTopSelling === "true";
  }

  const products = await ProductRepository.getAll(
    undefined,
    query,
    [
      { path: "seller", select: "walletAddress" },
      { path: "category", select: "name _id" },
    ],
    limitNumber,
    skip
  );

  const totalItems = await ProductRepository.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limitNumber);

  return ResponseHandler(res, 200, "Products retrieved successfully", {
    products,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalPages,
      totalItems,
    },
  });
});


// export const allProducts = AsyncHandler(async (req: Request, res: Response) => {
//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 10;
//   const skip = (page - 1) * limit;

//   const products = await ProductRepository.getAll(
//     undefined,
//     { stock: { $gt: 0 } },
//     [
//       { path: "seller", select: "walletAddress" },
//       { path: "category", select: "name" },
//     ],
//     limit,
//     skip
//   );

//   const totalItems = await ProductRepository.countDocuments({
//     stock: { $gt: 0 },
//   });
//   const totalPages = Math.ceil(totalItems / limit);

//   return ResponseHandler(res, 200, "All products retrieved successfully", {
//     products,
//     pagination: { page, limit, totalPages, totalItems },
//   });
// });

export const getProductById = AsyncHandler(
  async (req: Request, res: Response) => {
    const product = await ProductRepository.findById(req.params.productId, [
      { path: "seller", select: "walletAddress" },
    ]);
    if (!product) return ErrorHandler(res, "CART_NOT_FOUND", 404);
    return ResponseHandler(res, 200, "Product retrieved successfully", {
      product,
    });
  }
);

export const createProduct = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.roles?.includes(Roles.SELLER))
      return ErrorHandler(res, "SELLER_AUTH", 403);

    if (!req.files) return ErrorHandler(res, "FILE_ERROR", 400);

    const {
      title,
      description,
      price,
      category,
      stock,
      address,
      beds,
      baths,
      mapping_location,
      size_of_land,
      specialOfferPrice,
      isSpecialOffer,
      offerStartDate,
      offerEndDate,
    } = req.body;

    // const mappingLocation = JSON.parse(mapping_location);
    // console.log(mappingLocation.lat, mappingLocation.lng);

    // if (!mappingLocation || !mappingLocation.lat || !mappingLocation.lng) {
    //   return ErrorHandler(res, "MAP_LOCATION", 400);
    // }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const imageFiles = files.image_of_land;
    const documentFiles = files.document_of_land;

    // if (!files.image_of_land || !files.document_of_land) return ErrorHandler(res, "Files are missing",400);
    // if (!files.image_of_land || !files.document_of_land) return ErrorHandler(res, "Files are missing",400);
    if (!files.coverImage) return ErrorHandler(res, "Files are missing", 400);
    if (
      !files.image_of_land ||
      files.image_of_land.length === 0 ||
      files.image_of_land.length > 5
    ) {
      return ErrorHandler(
        res,
        "You must upload between 1 and 5 images of the land",
        400
      );
    }
    if (
      !documentFiles ||
      documentFiles.length === 0 ||
      documentFiles.length > 6
    ) {
      return ErrorHandler(
        res,
        "You must upload between 1 and 6 document files",
        400
      );
    }

    const documentUploads = await CloudinaryService.uploadMultiplePdfFiles(
      documentFiles.map((file) => file.path)
    );

    const documentUrls = documentUploads.map((upload) => upload.secure_url);

    const imageUploads = await CloudinaryService.uploadMultipleImages(
      files.image_of_land.map((file) => file.path)
    );

    const coverImageUrl = files.coverImage
      ? await CloudinaryService.uploadSingleImage(files.coverImage[0].path)
      : null;
    const imageUrls = imageUploads.map((upload) => upload.secure_url);

    const newProduct = await ProductRepository.create({
      title,
      description,
      price,
      category,
      seller: new Types.ObjectId(req._id),
      stock,
      address,
      isSpecialOffer,
      specialOfferPrice,
      // mapping_location: mappingLocation,
      image_of_land: imageUrls,
      size_of_land,
      document_of_land: documentUrls,
      coverImage: coverImageUrl?.secure_url || "",
      beds,
      baths,
      offerStartDate,
      offerEndDate,
      // document_of_land: documentUpload?.secure_url || "",
    });
    await newProduct.save();
    return ResponseHandler(res, 201, "Product uploaded successfully", {
      product: newProduct,
    });
  }
);

export const deleteProduct = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { productId } = req.params;

    const product = await ProductRepository.findById(
      req.params.productId,
      "seller"
    );
    if (!product) return ErrorHandler(res, "PRODUCT_NOT_FOUND", 404);
    if (String(product.seller._id) !== String(req._id))
      return ErrorHandler(res, "UNAUTHORIZED", 403);

    await ProductRepository.deleteById(productId);
    return ResponseHandler(res, 200, "Product deleted successfully");
  }
);

export const updateProduct = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const product = await ProductRepository.findById(
      req.params.productId,
      "seller"
    );
    if (!product) return ErrorHandler(res, "PRODUCT_NOT_FOUND", 404);
    if (req.body.mapping_location) {
      const mappingLocation = JSON.parse(req.body.mapping_location);
      console.log(mappingLocation.lat, mappingLocation.lng);
      if (!mappingLocation.lat || !mappingLocation.lng) {
        return ErrorHandler(res, "INVALID_MAP_LOCATION", 400);
      }
    }
    if (String(product.seller._id) !== String(req._id))
      return ErrorHandler(res, "Unauthorized", 401);
    const updateData: Partial<IProduct> = { ...req.body };
    const updatedProduct = await ProductRepository.updateById(
      req.params.productId,
      updateData
    );
    return ResponseHandler(res, 200, "Product updated successfully", {
      updatedProduct,
    });
  }
);
export const updateProductImage = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const product = await ProductRepository.findById(
      req.params.productId,
      "seller image_of_land"
    );

    if (!product) return ErrorHandler(res, "PRODUCT_NOT_FOUND", 404);
    if (String(product.seller._id) !== String(req._id))
      return ErrorHandler(res, "Unauthorized", 403);
    //     if (!req.files || typeof req.files !== 'object' || !('image_of_land' in req?.files)) return ErrorHandler(res, "No image file uploaded",400);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files || !files.image_of_land || files.image_of_land.length === 0) {
      return ErrorHandler(res, "No image file(s) uploaded", 400);
    }

    const uploadedCount = files.image_of_land.length;
    const existingCount = product.image_of_land?.length || 0;

    if (uploadedCount + existingCount > 5) {
      return ErrorHandler(
        res,
        `You can only have a maximum of 5 images. Currently: ${existingCount}`,
        400
      );
    }

    const newUploads = await CloudinaryService.uploadMultipleImages(
      files.image_of_land.map((file) => file.path)
    );

    const newImageUrls = newUploads.map((img) => img.secure_url);

    await ProductRepository.updateById(req.params.productId, {
      image_of_land: [...product.image_of_land, ...newImageUrls],
    });

    return ResponseHandler(res, 200, "Image(s) updated successfully");
  }
);
export const deleteProductImage = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { productId } = req.params;
    const { imageUrl } = req.query;

    if (!imageUrl || typeof imageUrl !== "string") {
      return ErrorHandler(res, "Missing or invalid imageUrl", 400);
    }

    const product = await ProductRepository.findById(
      productId,
      "seller image_of_land"
    );
    if (!product) return ErrorHandler(res, "PRODUCT_NOT_FOUND", 404);
    if (String(product.seller._id) !== String(req._id))
      return ErrorHandler(res, "Unauthorized", 403);

    if (!product.image_of_land.includes(imageUrl)) {
      return ErrorHandler(res, "Image not found in product", 400);
    }

    if (product.image_of_land.length === 1) {
      return ErrorHandler(
        res,
        "Cannot delete the only image. At least one image is required.",
        400
      );
    }

    const publicId = CloudinaryService.extractPublicId(imageUrl);
    if (!publicId) return ErrorHandler(res, "Failed to extract public ID", 500);

    await CloudinaryService.removeSingleImage(publicId);

    await ProductRepository.updateById(productId, {
      $pull: { image_of_land: imageUrl },
    });

    return ResponseHandler(res, 200, "Image deleted successfully");
  }
);

export const updateProductDocument = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const product = await ProductRepository.findById(
      req.params.productId,
      "seller document_of_land"
    );
    if (!product) return ErrorHandler(res, "PRODUCT_NOT_FOUND", 404);
    if (String(product.seller._id) !== String(req._id))
      return ErrorHandler(res, "Unauthorized", 403);
    if (
      !req.files ||
      typeof req.files !== "object" ||
      !("document_of_land" in req.files)
    )
      return ErrorHandler(res, "No document file uploaded", 400);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const newDocumentPath = files.document_of_land?.[0]?.path;
    if (!newDocumentPath) return ErrorHandler(res, "INVALID_FILE", 400);

    const documentUpload = await CloudinaryService.uploadPdfFile(
      newDocumentPath
    );
    if (product.document_of_land)
      await CloudinaryService.removeMultipleImages(product.document_of_land);
    await ProductRepository.updateById(req.params.productId, {
      document_of_land: documentUpload.secure_url,
    });

    return ResponseHandler(res, 204, "Document updated successfully");
  }
);

export const allSellerProduct = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const products = await ProductRepository.getAll(undefined, {
      seller: req._id,
    });
    return ResponseHandler(
      res,
      200,
      "All seller products retrieved successfully",
      { products }
    );
  }
);
//?
export const getSpecialOffers = AsyncHandler(
  async (req: Request, res: Response) => {
    const products = await ProductRepository.getAll(
      undefined,
      { isSpecialOffer: true, stock: { $gt: 0 } },
      [{ path: "seller", select: "walletAddress" }]
    );
    return ResponseHandler(res, 200, "Special offers fetched", { products });
  }
);

export const getBestDeals = AsyncHandler(
  async (req: Request, res: Response) => {
    const products = await ProductRepository.getAll(
      undefined,
      { isBestDeal: true, stock: { $gt: 0 } },
      [{ path: "seller", select: "walletAddress" }]
    );
    return ResponseHandler(res, 200, "Best deals fetched", { products });
  }
);

export const getTopSelling = AsyncHandler(
  async (req: Request, res: Response) => {
    const products = await ProductRepository.getAll(
      undefined,
      { isTopSelling: true, stock: { $gt: 0 } },
      [{ path: "seller", select: "walletAddress" }]
    );
    return ResponseHandler(res, 200, "Top selling properties fetched", {
      products,
    });
  }
);
// export const getFilteredProducts = AsyncHandler(
//   async (req: Request, res: Response) => {
//     const {
//       category,
//       specialOfferPrice,
//       isSpecialOffer,
//       isBestDeal,
//       isTopSelling,
//       page = "1",
//       limit = "10",
//     } = req.query;

//     const pageNumber = Number(page);
//     const limitNumber = Number(limit);
//     const skip = (pageNumber - 1) * limitNumber;

//     const query: any = { stock: { $gt: 0 } };
//     const  rawCategory =
//       typeof category === "string"
//         ? category
//         : Array.isArray(category)
//         ? category[0]
//         : "";

//     if (!mongoose.Types.ObjectId.isValid(category as string)) {
//       res.status(400).json({ message: "Invalid category ID" });
//       return;
//     }
//     if (category) query.category = rawCategory;

//     if (specialOfferPrice) {
//       const price = Number(specialOfferPrice);
//       if (!isNaN(price)) {
//         query.specialOfferPrice = { $lte: price };
//       }
//     }

//     if (isSpecialOffer !== undefined) {
//       query.isSpecialOffer = isSpecialOffer === "true";
//     }

//     if (isBestDeal !== undefined) {
//       query.isBestDeal = isBestDeal === "true";
//     }

//     if (isTopSelling !== undefined) {
//       query.isTopSelling = isTopSelling === "true";
//     }

//     const products = await ProductRepository.getAll(
//       undefined,
//       query,
//       [{ path: "seller", select: "walletAddress" },{path:'category',select:'name _id'}],
//       limitNumber,
//       skip
//     );

//     const totalItems = await ProductRepository.countDocuments(query);
//     const totalPages = Math.ceil(totalItems / limitNumber);

//     return ResponseHandler(
//       res,
//       200,
//       "Filtered products retrieved successfully",
//       {
//         products,
//         pagination: {
//           page: pageNumber,
//           limit: limitNumber,
//           totalPages,
//           totalItems,
//         },
//       }
//     );
//   }
// );

export const getProductByCategory = AsyncHandler(
  async (req: Request, res: Response) => {
    const rawCategory = req.query.category;

    const category =
      typeof rawCategory === "string"
        ? rawCategory
        : Array.isArray(rawCategory)
        ? rawCategory[0]
        : "";

    if (!mongoose.Types.ObjectId.isValid(category as string)) {
      res.status(400).json({ message: "Invalid category ID" });
      return;
    }

    const productCategory = await ProductRepository.getAll(
      undefined,
      {
        category: new mongoose.Types.ObjectId(category as string),
        isActive: true,
        stock: { $gt: 0 },
      },
      "category"
    );

    ResponseHandler(res, 200, "Product by category", productCategory);
  }
);
