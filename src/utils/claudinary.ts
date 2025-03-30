import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs";
import path from "path";

console.log(process.env.PORT)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

class CloudinaryService {

  static async uploadSingleImage(filePath: string): Promise<UploadApiResponse> {
    try {
      const result = await cloudinary.uploader.upload(filePath,{resource_type:'auto'});
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

      const result = await cloudinary.uploader.upload(filePath, { resource_type: resourceType });

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
      const result = await cloudinary.uploader.upload(filePath, { resource_type: "raw",  format: "pdf"  });
      fs.unlinkSync(filePath); 
      console.log(`✅ Uploaded: ${result.secure_url}`);
      console.log( { secure_url: result.secure_url, public_id: result.public_id })
      return result;
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      throw error;
    }
  }
  static async uploadMultipleImages(filePaths: string[]): Promise<UploadApiResponse[]> {
    console.log('uploadMultipleImages')
    try {
      const results: UploadApiResponse[] = [];
      for (const filePath of filePaths) {
        const result = await cloudinary.uploader.upload(filePath);
        results.push(result);
        fs.unlinkSync(filePath);
        console.log(`✅ Uploaded: ${result.secure_url}`);
      }
      return results;
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
    return parts.includes("upload") && fileName ? parts.slice(parts.indexOf("upload") + 1).join("/") : null;
  }
}

export default CloudinaryService;


 