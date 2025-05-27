import User from "../models/User";
import { IUser, KYCStatus, Roles } from "../types/IUser";
import Repository from "./repository";

class UserRepository extends Repository<IUser>{
     async getAllSellersWithKyc(limit = 20, skip = 0) {
    const query = { role: Roles.SELLER };
    return this.getAll(undefined, query, [], limit, skip);
  }
  async updateKycStatus(
    userId: string,
    status: KYCStatus,
    rejectedReason: string | null = null
  ) {
    const updateData: any = {
      'kyc.status': status,
      'kyc.rejectedReason': rejectedReason,
    };

    if (status === KYCStatus.APPROVED) {
      updateData['kyc.verifiedAt'] = new Date();
      updateData['kyc.rejectedReason'] = null;
    } else if (status === KYCStatus.REJECTED) {
      updateData['kyc.verifiedAt'] = null;
    } else if (status === KYCStatus.NOT_SUBMITTED) {
      updateData['kyc.verifiedAt'] = null;
      updateData['kyc.rejectedReason'] = null;
    }

    return this.updateById(userId, updateData);
  }
}

export default new UserRepository(User)