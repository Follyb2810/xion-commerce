import multer from "multer";
import path from "path";

class MulterService {
  private static storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
  });

  private static fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
      console.log('filer of file succesfull')
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, JPG, and PDF are allowed."));
    }
  };

  public static uploadSingle(fieldName: string) {
    return multer({ storage: this.storage, fileFilter: this.fileFilter }).single(fieldName);
  }

  public static uploadMultiple(fieldName: string, maxCount: number) {
    return multer({ storage: this.storage, fileFilter: this.fileFilter }).array(fieldName, maxCount);
  }
  public static uploadProductFiles() {
    return multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
    }).fields([
      { name: "image_of_land", maxCount: 4 },
      { name: "document_of_land", maxCount: 5 },
      { name: "coverImage", maxCount: 1 },
      { name: "kycDocuments", maxCount: 1 },
    ]);
  }
}

export default MulterService;
// const cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 9 }])
