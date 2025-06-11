import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs";
import path from "path";
import crypto from "crypto";

console.log(process.env.PORT);
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

class CloudinaryService {
  static async uploadSingleImage(filePath: string): Promise<UploadApiResponse> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "auto",
      });
      fs.unlinkSync(filePath);

      console.log(`✅ Uploaded: ${result.secure_url}`);
      return result;
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      throw error;
    }
  }
  static async uploadFile(filePath: string): Promise<UploadApiResponse> {
    try {
      const fileSize = fs.statSync(filePath).size;
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (fileSize > maxSize) {
        throw new Error("File size exceeds 10MB limit");
      }
      const isPdf = filePath.endsWith(".pdf");
      const resourceType = isPdf ? "raw" : "image";

      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: resourceType,
      });

      fs.unlinkSync(filePath);
      console.log(`✅ Uploaded: ${result.secure_url}`);
      return result;
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      throw error;
    }
  }

  static async uploadPdfFile(filePath: string): Promise<UploadApiResponse> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "auto",
        format: "pdf",
        folder: "documents",
      });
      fs.unlinkSync(filePath);
      console.log(`✅ Uploaded: ${result.secure_url}`);
      console.log({
        secure_url: result.secure_url,
        public_id: result.public_id,
      });
      return result;
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      throw error;
    }
  }
  static async uploadMultiplePdfFiles(
    filePaths: string[]
  ): Promise<UploadApiResponse[]> {
    try {
      const uploads = await Promise.all(
        filePaths.map(async (filePath) => {
          const fileSize = fs.statSync(filePath).size;
          const maxSize = 10 * 1024 * 1024; // 10 MB
          if (fileSize > maxSize) {
            throw new Error(
              `File ${path.basename(filePath)} exceeds 10MB limit`
            );
          }

          const result = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
            format: "pdf",
            folder: "documents",
          });

          fs.unlinkSync(filePath);
          return result;
        })
      );

      return uploads;
    } catch (error) {
      console.error("❌ Error uploading multiple PDFs:", error);
      throw error;
    }
  }

  static async uploadMultipleImages(
    filePaths: string[]
  ): Promise<UploadApiResponse[]> {
    try {
      const maxSize = 10 * 1024 * 1024;
      const uploads: UploadApiResponse[] = [];

      for (const filePath of filePaths) {
        const absolutePath = path.resolve(filePath);

        if (!fs.existsSync(absolutePath)) {
          console.warn(`⚠️ File not found: ${absolutePath}`);
          continue;
        }

        let fileSize;
        try {
          fileSize = fs.statSync(absolutePath).size;
        } catch (err) {
          if (err instanceof Error)
            console.warn(`❌ Can't stat file ${absolutePath}:`, err.message);
          continue;
        }

        if (fileSize > maxSize) {
          console.warn(`❌ File too large: ${path.basename(absolutePath)}`);
          continue;
        }

        const result = await cloudinary.uploader.upload(absolutePath, {
          resource_type: "image",
          // folder: "images",
        });

        fs.unlinkSync(absolutePath);
        console.log(`✅ Uploaded: ${result.secure_url}`);
        uploads.push(result);
      }

      return uploads;
    } catch (error) {
      console.error("❌ Error uploading multiple images:", error);
      throw error;
    }
  }

  static async removeSingleImage(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error("❌ Error deleting image:", error);
      throw new Error("Internal Server Error (Cloudinary)");
    }
  }

  static async removeMultipleImages(publicIds: string[]): Promise<any> {
    try {
      const result = await cloudinary.api.delete_resources(publicIds);
      return result;
    } catch (error) {
      console.error("❌ Error deleting multiple images:", error);
      throw new Error("Internal Server Error (Cloudinary)");
    }
  }
  static extractPublicId(imageUrl: string): string | null {
    const parts = imageUrl.split("/");
    const fileName = parts.pop()?.split(".")[0];
    return parts.includes("upload") && fileName
      ? parts.slice(parts.indexOf("upload") + 1).join("/")
      : null;
  }
}

export default CloudinaryService;
