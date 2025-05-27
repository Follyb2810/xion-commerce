import { Request, Response } from "express";
import User from "../models/User";
import Repository from "../repositories/repository";
import { IUser, Roles } from "../types/IUser";
import crypto from "crypto";
import { ComparePassword, hashPwd } from "../utils/bcrypt";
import JwtService from "../utils/jwt";
import AsyncHandler from "express-async-handler";
import { UserResponse } from "../types/IAuthResponse";
import { AuthRequest } from "../middleware/auth";
import { ErrorHandler, ResponseHandler } from "../utils/ResponseHandler";
import XionWallet from "../utils/wallet/xion_wallet";

const authRepository = new Repository(User);

export const register = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
        return ErrorHandler(res,'EMAIL_PASS_ERROR', 400);
    }

    const existingUser = await authRepository.findByEntity({ email });
    if (existingUser) {
        return ErrorHandler(res, "USER_EXIST",400);
    }

    const hashedPassword = await hashPwd(password);
    // const userWallet =await XionWallet.generateAddressFromEmail(email)
    const newUser = await authRepository.create({
        email,
        password: hashedPassword,
        // walletAddress: userWallet.address,
        // mnemonic: userWallet.mnemonic
    } as Partial<IUser>);

    newUser.refreshToken = crypto.randomBytes(40).toString("hex");
    if(!newUser.role.includes(Roles.SELLER)){
        newUser.role.push(Roles.SELLER)
    }
    await newUser.save();

    const accessToken = JwtService.signToken({ id: newUser._id, roles: newUser.role });
    return ResponseHandler(res, 201, "User registered successfully", { accessToken, user: UserResponse(newUser) });
});

export const login = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
        return ErrorHandler(res, "EMAIL_PASS_ERROR",400);
    }

    const user = await authRepository.findByEntity({ email });
    if (!user || !(await ComparePassword(password, user.password!))) {
        return ErrorHandler(res, "INVALID_CREDENTIALS",401);
    }

    user.refreshToken = crypto.randomBytes(40).toString("hex");
    await user.save();

    const accessToken = JwtService.signToken({ id: user._id, roles: user.role });
    return ResponseHandler(res, 200, "Login successful", { accessToken, user: UserResponse(user) });
});

export const SingleUser = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await authRepository.findById(id);
    if (!user) {
        return ErrorHandler(res,"USER_NOTFOUND", 404);
    }
    return ResponseHandler(res, 200, "User retrieved successfully", { user: UserResponse(user) });
});

export const verifyUser = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await authRepository.findById(id);
    if (!user) {
        return ErrorHandler(res, "USER_NOTFOUND",404);
    }

    await authRepository.updateOne({ _id: id }, { $addToSet: { role: Roles.SELLER } });
    return ResponseHandler(res, 200, "User successfully verified");
});

export const removeUserRole = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { role } = req.body;
    if (!Object.values(Roles).includes(role)) {
        return ErrorHandler(res,  "INVALID_ROLE",400);
    }

    const user = await authRepository.findById(id);
    if (!user) {
        return ErrorHandler(res, "USER_NOTFOUND",404);
    }

    await authRepository.updateOne({ _id: id }, { $pull: { role } });
    return ResponseHandler(res, 200, "Role removed successfully");
});

export const UserProfile = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req._id;
    const user = await authRepository.findById(id!);
    if (!user) {
        return ErrorHandler(res, "USER_NOTFOUND",404);
    }
    return ResponseHandler(res, 200, "User profile retrieved successfully", { user: UserResponse(user) });
});

export const allUser = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const users = await authRepository.getAll();
    return ResponseHandler(res, 200, "All users retrieved successfully", { users: users.map(UserResponse) });
});
export const updateUserProfile = AsyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req._id;
    let { email, phoneNumber, name } = req.body;

    if (!email && !phoneNumber && !name) {
      return ErrorHandler(res, "NO_DATA_PROVIDED", 400);
    }

    const user = await authRepository.findById(id!);
    if (!user) {
      return ErrorHandler(res, "USER_NOTFOUND", 404);
    }

    const normalizedEmail = email?.trim().toLowerCase();

    if (normalizedEmail && normalizedEmail !== user.email) {
      const emailTaken = await authRepository.findByEntity({ email: normalizedEmail });

      const isEmailUsedByAnotherUser =
        emailTaken && emailTaken._id.toString() !== user._id.toString();

      if (isEmailUsedByAnotherUser) {
        return ErrorHandler(res, "USER_EXIST", 409);
      }
    }

    const updates: Partial<IUser> = {};

    if (normalizedEmail) updates.email = normalizedEmail;
    if (phoneNumber) updates.phoneNumber = phoneNumber;
    if (name) {
      updates.profile = {
        ...user.profile,
        name,
      };
    }

    const updatedUser = await authRepository.updateById(id!, updates);

    return ResponseHandler(res, 200, "User profile updated successfully", {
      user: UserResponse(updatedUser),
    });
  }
);


//? kyc
// export const uploadKycDocuments = AsyncHandler(async (req: AuthRequest, res: Response) => {
//   const userId = req.user?.id;
//   if (!userId) return ErrorHandler(res, "UNAUTHORIZED", 401);
//   if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
//     return ErrorHandler(res, "NO_FILES_UPLOADED", 400);
//   }

//   const files = req.files as Express.Multer.File[];
//   const filePaths = files.map(f => f.path); // or f.filename or URL depending on your setup

//   const user = await authRepository.findById(userId);
//   if (!user) return ErrorHandler(res, "USER_NOTFOUND", 404);

//   user.kycDocuments.push(...filePaths);
//   user.kycStatus = 'pending';
//   user.kycSubmittedAt = new Date();
//   user.kycRejectedReason = null; // reset rejection reason on resubmission

//   await user.save();

//   return ResponseHandler(res, 200, "KYC documents uploaded successfully", { kycStatus: user.kycStatus, kycDocuments: user.kycDocuments });
// });

// export const approveKyc = AsyncHandler(async (req: AuthRequest, res: Response) => {
//   const { id } = req.params; // user id
//   // Add check for admin or superadmin role here

//   const user = await authRepository.findById(id);
//   if (!user) return ErrorHandler(res, "USER_NOTFOUND", 404);

//   user.kycStatus = 'approved';
//   user.kycVerifiedAt = new Date();
//   user.kycRejectedReason = null;

//   await user.save();

//   return ResponseHandler(res, 200, "User KYC approved");
// });

// export const rejectKyc = AsyncHandler(async (req: AuthRequest, res: Response) => {
//   const { id } = req.params; // user id
//   const { reason } = req.body;

//   // Add check for admin or superadmin role here

//   const user = await authRepository.findById(id);
//   if (!user) return ErrorHandler(res, "USER_NOTFOUND", 404);

//   user.kycStatus = 'rejected';
//   user.kycRejectedReason = reason || "No reason provided";
//   user.kycVerifiedAt = null;

//   await user.save();

//   return ResponseHandler(res, 200, "User KYC rejected");
// });

// export const uploadKycDocument = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
//   const userId = req.user?.id;
//   if (!userId) return ErrorHandler(res, "UNAUTHORIZED", 401);

//   const user = await User.findById(userId);
//   if (!user) return ErrorHandler(res, "USER_NOTFOUND", 404);

//   // Assume req.file is populated by multer
//   if (!req.file) return ErrorHandler(res, "NO_FILE_UPLOADED", 400);

//   const { docType } = req.body;
//   if (!docType) return ErrorHandler(res, "DOCUMENT_TYPE_REQUIRED", 400);

//   // Append new doc info to user.kyc.documents
//   user.kyc = user.kyc || { status: "pending", documents: [] };
//   user.kyc.documents.push({
//     type: docType,
//     url: req.file.path,  // or public URL if uploaded to cloud
//     uploadedAt: new Date(),
//   });

//   // Mark KYC as pending since a new doc was uploaded
//   user.kyc.status = "pending";
//   user.kyc.submittedAt = new Date();

//   await user.save();

//   ResponseHandler(res, 200, "KYC document uploaded successfully", { documents: user.kyc.documents });
// });

// // Get KYC status and docs
// export const getKycStatus = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
//   const userId = req.user?.id;
//   if (!userId) return ErrorHandler(res, "UNAUTHORIZED", 401);

//   const user = await User.findById(userId);
//   if (!user) return ErrorHandler(res, "USER_NOTFOUND", 404);

//   ResponseHandler(res, 200, "KYC status retrieved", {
//     status: user.kyc?.status || "not_submitted",
//     documents: user.kyc?.documents || [],
//     rejectedReason: user.kyc?.rejectedReason,
//   });
// });

// // Admin approves or rejects KYC
// export const adminUpdateKycStatus = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
//   const { userId, status, rejectedReason } = req.body;
//   if (!userId || !['approved', 'rejected', 'pending'].includes(status)) {
//     return ErrorHandler(res, "INVALID_REQUEST", 400);
//   }

//   const user = await User.findById(userId);
//   if (!user) return ErrorHandler(res, "USER_NOTFOUND", 404);

//   user.kyc = user.kyc || { documents: [], status: "pending" };
//   user.kyc.status = status;
//   if (status === 'approved') {
//     user.kyc.verifiedAt = new Date();
//     user.kyc.rejectedReason = undefined;
//   } else if (status === 'rejected') {
//     user.kyc.rejectedReason = rejectedReason || "Not specified";
//   }

//   await user.save();

//   ResponseHandler(res, 200, `KYC status updated to ${status}`);
// });
// router.post('/kyc/upload', authenticate, upload.single('document'), kycController.uploadKycDocument);

// // User gets KYC status
// router.get('/kyc/status', authenticate, kycController.getKycStatus);

// // Admin updates KYC status
// router.post('/kyc/admin/update', authenticate, kycController.adminUpdateKycStatus);