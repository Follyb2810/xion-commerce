import AsyncHandler from "express-async-handler";
import { AuthRequest } from "../middleware/auth";
import { Request, Response } from "express";
import { ErrorHandler, ResponseHandler } from "../utils/ResponseHandler";
import UserRepository from "../repositories/UserRepository";
import CloudinaryService from "../utils/claudinary";
import { KYCStatus, Roles } from "../types/IUser";
import { UserResponse } from "../types/IAuthResponse";

export const uploadKycDocuments = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req._id;
  const { documentType } = req.body;

  if (!userId) return ErrorHandler(res, "UNAUTHORIZED", 401);
  if (!req.file) return ErrorHandler(res, "FILE_ERROR", 400);

  const user = await UserRepository.findById(userId);
  if (!user) return ErrorHandler(res, "USER_NOTFOUND", 404);

  const kycDoc = req.file;

  const uploadKyc = await CloudinaryService.uploadPdfFile(kycDoc.path);
  if (!uploadKyc?.secure_url) return ErrorHandler(res, "Cloud upload failed", 500);

  if (!user.kyc) {
    user.kyc = {
      status: KYCStatus.NOT_SUBMITTED,
      documents: [],
    };
  }

  user.kyc.documents = [
    {
      type: documentType,
      url: uploadKyc.secure_url,
      uploadedAt: new Date(),
    },
  ];

  user.kyc.submittedAt = new Date();
  user.kyc.status = KYCStatus.PENDING;

  //Todo just give seller role for now becuase i have no verification to use now
  if(!user.role.includes(Roles.SELLER)){
    user.role.push(Roles.SELLER);
  }
  user.isVerified = true;

  await user.save();

  return ResponseHandler(res, 200, "KYC document uploaded successfully", {
          user: UserResponse(user),
  });
});

export const verifyKYC = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req._id;
  const { status, rejectedReason } = req.body;

  if (!userId) return ErrorHandler(res, "UNAUTHORIZED", 401);

  const normalizedStatus = typeof status === "string" ? status.toLowerCase() : "";

  if (!Object.values(KYCStatus).includes(normalizedStatus as KYCStatus)) {
    return ErrorHandler(res, "Invalid KYC status", 400);
  }

  const user = await UserRepository.findById(userId);
  if (!user) return ErrorHandler(res, "USER_NOTFOUND", 404);

  if (!user.kyc) {
    user.kyc = {
      status: KYCStatus.NOT_SUBMITTED,
      documents: [],
    };
  }

  user.kyc.status = normalizedStatus as KYCStatus;

  if (normalizedStatus === KYCStatus.APPROVED) {
    user.kyc.verifiedAt = new Date();
    user.kyc.rejectedReason = undefined;
  } else if (normalizedStatus === KYCStatus.REJECTED) {
    user.kyc.verifiedAt = undefined;
    user.kyc.rejectedReason = rejectedReason || "No reason provided";
    user.isVerified = false;
  }

  await user.save();

  return ResponseHandler(res, 200, "KYC status updated successfully", {
    kycStatus: user.kyc.status,
  });
});
export const getKycStatus = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req._id;
  if (!userId) return ErrorHandler(res, "UNAUTHORIZED", 401);

  const user = await UserRepository.findById(userId,'kyc');
  if (!user) return ErrorHandler(res, "USER_NOTFOUND", 404);

  ResponseHandler(res, 200, "KYC status retrieved", {
    status: user.kyc?.status || "not_submitted",
    documents: user.kyc?.documents || [],
    rejectedReason: user.kyc?.rejectedReason,
  });
});

