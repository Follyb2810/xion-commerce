import express, { Request, Response } from 'express';

function isAdmin(req: Request, res: Response, next: Function) {
  // e.g. check req.user.role includes Roles.ADMIN or Roles.SUPER_ADMIN
  // if not admin return res.status(403).json({ message: 'Forbidden' });
  next();
}

// router.use(isAdmin);

// // GET /kyc/sellers - list all sellers with their KYC info
// router.get('/kyc/sellers', async (req: Request, res: Response) => {
//   try {
//     const limit = parseInt(req.query.limit as string) || 20;
//     const skip = parseInt(req.query.skip as string) || 0;
//     const sellers = await userRepository.getAllSellersWithKyc(limit, skip);
//     res.json(sellers);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch sellers', error: err.message });
//   }
// });

// // POST /kyc/approve/:id - approve KYC for seller by id
// router.post('/kyc/approve/:id', async (req: Request, res: Response) => {
//   try {
//     const userId = req.params.id;
//     const user = await userRepository.findById(userId);

//     if (!user || !user.role.includes(Roles.SELLER)) {
//       return res.status(404).json({ message: 'Seller not found' });
//     }

//     const updatedUser = await userRepository.updateKycStatus(userId, KYCStatus.APPROVED);
//     res.json({ message: 'KYC approved', user: updatedUser });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to approve KYC', error: err.message });
//   }
// });

// // POST /kyc/reject/:id - reject KYC for seller by id, with reason
// router.post('/kyc/reject/:id', async (req: Request, res: Response) => {
//   try {
//     const userId = req.params.id;
//     const { reason } = req.body;
//     if (!reason || typeof reason !== 'string') {
//       return res.status(400).json({ message: 'Rejection reason is required' });
//     }

//     const user = await userRepository.findById(userId);
//     if (!user || !user.role.includes(Roles.SELLER)) {
//       return res.status(404).json({ message: 'Seller not found' });
//     }

//     const updatedUser = await userRepository.updateKycStatus(userId, KYCStatus.REJECTED, reason);
//     res.json({ message: 'KYC rejected', user: updatedUser });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to reject KYC', error: err.message });
//   }
// });

// // POST /kyc/revoke/:id - revoke KYC approval (set status to NOT_SUBMITTED)
// router.post('/kyc/revoke/:id', async (req: Request, res: Response) => {
//   try {
//     const userId = req.params.id;
//     const user = await userRepository.findById(userId);
//     if (!user || !user.role.includes(Roles.SELLER)) {
//       return res.status(404).json({ message: 'Seller not found' });
//     }

//     const updatedUser = await userRepository.updateKycStatus(userId, KYCStatus.NOT_SUBMITTED);
//     res.json({ message: 'KYC revoked', user: updatedUser });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to revoke KYC', error: err.message });
//   }
// });

// export default router;
