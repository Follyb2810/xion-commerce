import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs";
import path from "path";

// console.log({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
//   api_key: process.env.CLOUDINARY_API_KEY as string,
//   api_secret: process.env.CLOUDINARY_API_SECRET as string,
// })
console.log(process.env.PORT)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

class CloudinaryService {

  static async uploadSingleImage(filePath: string): Promise<UploadApiResponse> {
    console.log('uploadSingleImage')

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
    console.log("Uploading file:", filePath);
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
    console.log('uploadFile')
    console.log(filePath,'uploadFile')
    console.log("File Size (bytes):", fs.statSync(filePath).size);
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
    console.log('removeSingleImage')
    try {
      // const publicId = CloudinaryService.extractPublicId(imageUrl);
      // if (!publicId) return;
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error("❌ Error deleting image:", error);
      throw new Error("Internal Server Error (Cloudinary)");
    }
  }

  static async removeMultipleImages(publicIds: string[]): Promise<any> {
    console.log('removeMultipleImages')
    try {
      const result = await cloudinary.api.delete_resources(publicIds);
      return result;
    } catch (error) {
      console.error("❌ Error deleting multiple images:", error);
      throw new Error("Internal Server Error (Cloudinary)");
    }
  }
  static extractPublicId(imageUrl: string): string | null {
    console.log('extractPublicId')
    const parts = imageUrl.split("/");
    const fileName = parts.pop()?.split(".")[0];
    return parts.includes("upload") && fileName ? parts.slice(parts.indexOf("upload") + 1).join("/") : null;
  }
}

export default CloudinaryService;


  // static async uploadFile(filePath: string): Promise<UploadApiResponse> {
  //   console.log("Uploading file:", filePath);
    
  //   try {
  //     if (!fs.existsSync(filePath)) {
  //       throw new Error(`File does not exist at path: ${filePath}`);
  //     }
      
  //     const fileStats = fs.statSync(filePath);
  //     console.log(`File exists. Size: ${fileStats.size} bytes`);
      
  //     if (fileStats.size === 0) {
  //       throw new Error(`File is empty: ${filePath}`);
  //     }
      
  //     // Determine file type - use file extension and also try to detect from content
  //     const ext = path.extname(filePath).toLowerCase();
  //     const isPdf = ext === '.pdf';
  //     console.log(`File extension: ${ext}, isPdf: ${isPdf}`);
      
  //     // Add specific options based on file type
  //     const uploadOptions: any = {
  //       resource_type: isPdf ? "raw" : "auto", // Try 'auto' instead of 'image'
  //       use_filename: true,
  //       unique_filename: true,
  //       overwrite: true
  //     };
      
  //     console.log("Upload options:", uploadOptions);
      
  //     // Attempt the upload with more detailed options
  //     const result = await cloudinary.uploader.upload(filePath, uploadOptions);
      
  //     console.log("Upload successful. Result:", {
  //       secure_url: result.secure_url,
  //       public_id: result.public_id,
  //       format: result.format,
  //       resource_type: result.resource_type
  //     });
      
  //     // Clean up file
  //     fs.unlinkSync(filePath);
  //     console.log(`Removed temporary file: ${filePath}`);
      
  //     return result;
  //   } catch (error: any) {
  //     console.error("❌ Error uploading file:", error);
      
  //     // Enhanced error logging
  //     if (error.http_code) {
  //       console.error(`Cloudinary HTTP Error ${error.http_code}: ${error.message}`);
  //     }
      
  //     // Try to read a small portion of the file to check content
  //     try {
  //       const fd = fs.openSync(filePath, 'r');
  //       const buffer = Buffer.alloc(100); // Read first 100 bytes
  //       fs.readSync(fd, buffer, 0, 100, 0);
  //       console.error("File header (first 100 bytes):", buffer.toString('hex'));
  //       fs.closeSync(fd);
  //     } catch (readError) {
  //       console.error("Could not read file for debugging:", readError);
  //     }
      
  //     throw error;
  //   }
  // }
  // static async uploadFileWithBuffer(filePath: string): Promise<UploadApiResponse> {
  //   console.log("Uploading file with buffer method:", filePath);
    
  //   try {
  //     // Read the entire file into a buffer
  //     const fileBuffer = fs.readFileSync(filePath);
  //     console.log(`Read file into buffer. Size: ${fileBuffer.length} bytes`);
      
  //     // Determine file type
  //     const ext = path.extname(filePath).toLowerCase();
  //     const isPdf = ext === '.pdf';
      
  //     if (isPdf) {
  //       // For PDF, use data URI
  //       const base64Pdf = fileBuffer.toString('base64');
  //       const dataUri = `data:application/pdf;base64,${base64Pdf}`;
        
  //       const result = await cloudinary.uploader.upload(dataUri, {
  //         resource_type: "raw",
  //         format: "pdf"
  //       });
        
  //       fs.unlinkSync(filePath);
  //       return result;
  //     } else {
  //       // For images, use data URI
  //       const base64Image = fileBuffer.toString('base64');
  //       const dataUri = `data:image/png;base64,${base64Image}`;
        
  //       const result = await cloudinary.uploader.upload(dataUri, {
  //         resource_type: "image"
  //       });
        
  //       fs.unlinkSync(filePath);
  //       return result;
  //     }
  //   } catch (error) {
  //     console.error("❌ Error uploading file with buffer method:", error);
  //     throw error;
  //   }
  // }
  // static async uploadFile(filePath: string): Promise<UploadApiResponse> {
  //   console.log("Uploading file:", filePath);
  //   try {
  //     // Read file into buffer
  //     const fileBuffer = fs.readFileSync(filePath);
      
  //     // Check if buffer is valid
  //     if (!fileBuffer || fileBuffer.length === 0) {
  //       throw new Error(`Invalid file buffer for: ${filePath}`);
  //     }
      
  //     // Convert buffer to base64
  //     const base64File = `data:image/png;base64,${fileBuffer.toString('base64')}`;
      
  //     // Upload base64 file
  //     const result = await cloudinary.uploader.upload(base64File);
      
  //     fs.unlinkSync(filePath); // Remove the file after upload
  //     console.log(`✅ Uploaded: ${result.secure_url}`);
  //     return result;
  //   } catch (error) {
  //     console.error("❌ Error uploading file:", error);
  //     throw error;
  //   }
  // }
//   static async uploadFile(filePath: string): Promise<UploadApiResponse> {
//     console.log("Uploading file:", filePath);
//     // Add this before attempting to upload
// const fileStats = fs.statSync(filePath);
// console.log(`File size: ${fileStats.size} bytes`);
// if (fileStats.size === 0) {
//   throw new Error(`File is empty: ${filePath}`);
// }
//     try {
//       const absolutePath = path.resolve(filePath);
//       console.log("Absolute path:", absolutePath);
      
//       // Check if file exists
//       if (!fs.existsSync(absolutePath)) {
//         throw new Error(`File does not exist at path: ${absolutePath}`);
//       }
      
//       // Check the file extension to determine the upload type
//       const isPdf = filePath.endsWith(".pdf");
//       const resourceType = isPdf ? "raw" : "image";
  
//       const result = await cloudinary.uploader.upload(absolutePath, { 
//         resource_type: resourceType 
//       });
  
//       fs.unlinkSync(absolutePath); // Remove the file after upload
//       console.log(`✅ Uploaded: ${result.secure_url}`);
//       return result;
//     } catch (error) {
//       console.error("❌ Error uploading file:", error);
//       throw error;
//     }
//   }
  // static async uploadFile(filePath: string): Promise<UploadApiResponse> {
  //   console.log("Uploading file:", filePath);
  //   try {
  //     // Check the file extension to determine the upload type
  //     const isPdf = filePath.endsWith(".pdf");
  //     const resourceType = isPdf ? "raw" : "image"; // "raw" for PDFs, "image" for others

  //     const result = await cloudinary.uploader.upload(filePath, { resource_type: resourceType });

  //     fs.unlinkSync(filePath); // Remove the file after upload
  //     console.log(`✅ Uploaded: ${result.secure_url}`);
  //     return result;
  //   } catch (error) {
  //     console.error("❌ Error uploading file:", error);
  //     throw error;
  //   }
  // }
  // static async uploadFile(filePath: string): Promise<UploadApiResponse> {
  //   console.log('uploadFile')
  //   console.log(filePath,'uploadFile')
    
  //   try {
  //     const result = await cloudinary.uploader.upload(filePath, { resource_type: "auto" });
  //     fs.unlinkSync(filePath); 
  //     console.log(`✅ Uploaded: ${result.secure_url}`);
  //     console.log( { secure_url: result.secure_url, public_id: result.public_id })
  //     return result;
  //   } catch (error) {
  //     console.error("❌ Error uploading file:", error);
  //     throw error;
  //   }
  // }
