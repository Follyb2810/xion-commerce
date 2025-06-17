import mongoose, { Types } from "mongoose";
import ProductRepository from "./product.repository";
import CloudinaryService from "./../../common/libs/claudinary";
import { IProduct } from "./../../common/types/IProduct";
import { IMapingLocation } from "./product.type";

interface ProductQueryParams {
  category?: string;
  specialOfferPrice?: string;
  isSpecialOffer?: string;
  isBestDeal?: string;
  isTopSelling?: string;
  page?: string;
  limit?: string;
}

interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  address: string;
  beds?: number;
  baths?: number;
  // mapping_location?: string;
  size_of_land?: string;
  specialOfferPrice?: number;
  isSpecialOffer?: boolean;
  offerStartDate?: Date;
  offerEndDate?: Date;
  sellerId: string;
  // sellerId: Types.ObjectId;
}

interface ProductFiles {
  image_of_land?: Express.Multer.File[];
  document_of_land?: Express.Multer.File[];
  coverImage?: Express.Multer.File[];
}

class ProductService {
  async getAllProducts(queryParams: ProductQueryParams) {
    const {
      category,
      specialOfferPrice,
      isSpecialOffer,
      isBestDeal,
      isTopSelling,
      page = "1",
      limit = "10",
    } = queryParams;

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

      if (!mongoose.Types.ObjectId.isValid(rawCategory)) {
        throw new Error("INVALID_CATEGORY_ID");
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

    return {
      products,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        totalItems,
      },
    };
  }

  async getProductById(productId: string) {
    const product = await ProductRepository.findById(productId, [
      { path: "seller", select: "walletAddress" },
    ]);

    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    return product;
  }

  async createProduct(productData: CreateProductInput, files: ProductFiles) {
    const {
      sellerId,
      category,
      // mapping_location
      ...rest
    } = productData;

    if (!files.coverImage) {
      throw new Error("COVER_IMAGE_REQUIRED");
    }

    if (
      !files.image_of_land ||
      files.image_of_land.length === 0 ||
      files.image_of_land.length > 5
    ) {
      throw new Error("INVALID_IMAGE_COUNT");
    }

    if (
      !files.document_of_land ||
      files.document_of_land.length === 0 ||
      files.document_of_land.length > 6
    ) {
      throw new Error("INVALID_DOCUMENT_COUNT");
    }
    // const mappingLocation = JSON.parse(mapping_location);
    // console.log(mappingLocation.lat, mappingLocation.lng);

    // if (!mappingLocation || !mappingLocation.lat || !mappingLocation.lng) {
    //   return ErrorHandler(res, "MAP_LOCATION", 400);
    // }
    // Upload documents
    const documentUploads = await CloudinaryService.uploadMultiplePdfFiles(
      files.document_of_land.map((file) => file.path)
    );
    const documentUrls = documentUploads.map((upload) => upload.secure_url);

    const imageUploads = await CloudinaryService.uploadMultipleImages(
      files.image_of_land.map((file) => file.path)
    );
    const imageUrls = imageUploads.map((upload) => upload.secure_url);

    const coverImageUrl = await CloudinaryService.uploadSingleImage(
      files.coverImage[0].path
    );

    const newProduct = await ProductRepository.create({
      ...rest,
      // mapping_location: mappingLocation,
      seller: new Types.ObjectId(sellerId),
      category: new Types.ObjectId(sellerId),
      image_of_land: imageUrls,
      document_of_land: documentUrls,
      coverImage: coverImageUrl.secure_url,
    });

    await newProduct.save();
    return newProduct;
  }

  async deleteProduct(productId: string, userId: string) {
    const product = await ProductRepository.findById(productId, "seller");
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    if (String(product.seller._id) !== String(userId)) {
      throw new Error("UNAUTHORIZED");
    }

    await ProductRepository.deleteById(productId);
    return true;
  }

  async updateProduct(
    productId: string,
    userId: string,
    updateData: Partial<IProduct>
  ) {
    const product = await ProductRepository.findById(productId, "seller");
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    if (String(product.seller._id) !== String(userId)) {
      throw new Error("UNAUTHORIZED");
    }

    if (updateData.mapping_location) {
      let mappingLocation: IMapingLocation;
      if (typeof updateData.mapping_location === "object") {
        mappingLocation = updateData.mapping_location;
      } else {
        mappingLocation = JSON.parse(updateData.mapping_location);
      }
      if (!mappingLocation.lat || !mappingLocation.lng) {
        throw new Error("INVALID_MAP_LOCATION");
      }
      updateData.mapping_location = mappingLocation;
    }

    const updatedProduct = await ProductRepository.updateById(
      productId,
      updateData
    );
    return updatedProduct;
  }

  async updateProductImage(
    productId: string,
    userId: string,
    files: Express.Multer.File[]
  ) {
    const product = await ProductRepository.findById(
      productId,
      "seller image_of_land"
    );
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    if (String(product.seller._id) !== String(userId)) {
      throw new Error("UNAUTHORIZED");
    }

    if (!files || files.length === 0) {
      throw new Error("NO_IMAGE_FILES");
    }

    const uploadedCount = files.length;
    const existingCount = product.image_of_land?.length || 0;

    if (uploadedCount + existingCount > 5) {
      throw new Error("IMAGE_LIMIT_EXCEEDED");
    }

    const newUploads = await CloudinaryService.uploadMultipleImages(
      files.map((file) => file.path)
    );

    const newImageUrls = newUploads.map((img) => img.secure_url);

    await ProductRepository.updateById(productId, {
      image_of_land: [...product.image_of_land, ...newImageUrls],
    });

    return true;
  }

  async deleteProductImage(
    productId: string,
    userId: string,
    imageUrl: string
  ) {
    if (!imageUrl) {
      throw new Error("IMAGE_URL_REQUIRED");
    }

    const product = await ProductRepository.findById(
      productId,
      "seller image_of_land"
    );
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    if (String(product.seller._id) !== String(userId)) {
      throw new Error("UNAUTHORIZED");
    }

    if (!product.image_of_land.includes(imageUrl)) {
      throw new Error("IMAGE_NOT_FOUND");
    }

    if (product.image_of_land.length === 1) {
      throw new Error("CANNOT_DELETE_ONLY_IMAGE");
    }

    const publicId = CloudinaryService.extractPublicId(imageUrl);
    if (!publicId) {
      throw new Error("FAILED_TO_EXTRACT_PUBLIC_ID");
    }

    await CloudinaryService.removeSingleImage(publicId);
    await ProductRepository.updateById(productId, {
      $pull: { image_of_land: imageUrl },
    });

    return true;
  }

  async updateProductDocument(
    productId: string,
    userId: string,
    documentFile: Express.Multer.File
  ) {
    const product = await ProductRepository.findById(
      productId,
      "seller document_of_land"
    );
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    if (String(product.seller._id) !== String(userId)) {
      throw new Error("UNAUTHORIZED");
    }

    if (!documentFile) {
      throw new Error("NO_DOCUMENT_FILE");
    }

    const documentUpload = await CloudinaryService.uploadPdfFile(
      documentFile.path
    );

    if (product.document_of_land) {
      await CloudinaryService.removeMultipleImages(product.document_of_land);
    }

    await ProductRepository.updateById(productId, {
      document_of_land: documentUpload.secure_url,
    });

    return true;
  }

  async getSellerProducts(sellerId: string) {
    const products = await ProductRepository.getAll(undefined, {
      seller: sellerId,
    });

    return products;
  }

  async getSpecialOffers() {
    const products = await ProductRepository.getAll(
      undefined,
      { isSpecialOffer: true, stock: { $gt: 0 } },
      [{ path: "seller", select: "walletAddress" }]
    );

    return products;
  }

  async getBestDeals() {
    const products = await ProductRepository.getAll(
      undefined,
      { isBestDeal: true, stock: { $gt: 0 } },
      [{ path: "seller", select: "walletAddress" }]
    );

    return products;
  }

  async getTopSelling() {
    const products = await ProductRepository.getAll(
      undefined,
      { isTopSelling: true, stock: { $gt: 0 } },
      [{ path: "seller", select: "walletAddress" }]
    );

    return products;
  }

  async getProductsByCategory(categoryId: string) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new Error("INVALID_CATEGORY_ID");
    }

    const products = await ProductRepository.getAll(
      undefined,
      {
        category: new mongoose.Types.ObjectId(categoryId),
        isActive: true,
        stock: { $gt: 0 },
      },
      "category"
    );

    return products;
  }
}

export default new ProductService();
