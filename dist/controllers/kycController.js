"use strict";
// export class KYCController {
//   static async submitKYC(req: Request, res: Response) {
//     try {
//       const { fullName, dateOfBirth, documentType, documentNumber } = req.body;
//       const documentImage = req.file?.path;
//       if (!documentImage) {
//         throw new Error('Document image is required');
//       }
//       await User.findByIdAndUpdate(req.user._id, {
//         kycData: {
//           fullName,
//           dateOfBirth,
//           documentType,
//           documentNumber,
//           documentImage,
//           verificationStatus: 'pending',
//         },
//       });
//       res.json({ message: 'KYC submitted successfully' });
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   }
//   static async verifyKYC(req: Request, res: Response) {
//     try {
//       const { userId, status } = req.body;
//       const user = await User.findByIdAndUpdate(userId, {
//         'kycData.verificationStatus': status,
//         isKYCVerified: status === 'approved',
//       });
//       res.json({ message: 'KYC verification status updated' });
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   }
// }
// router.post('/kyc/submit', authMiddleware, upload.single('document'), KYCController.submitKYC);
// router.post('/kyc/verify', 
//   authMiddleware, 
//   roleCheck([UserRole.ADMIN, UserRole.SUPER_ADMIN]), 
//   KYCController.verifyKYC
// );
