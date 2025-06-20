import { IUserDto } from "./user.dto";
import { IUser } from "./../../common/types/IUser";

export const UserResponse = (result: IUser): IUserDto => {
  return {
    email: result.email!,
    role: result.role,
    profile: result.profile
      ? {
          name: result.profile.name!,
          bio: result.profile.bio!,
          avatar: result.profile.avatar!,
        }
      : undefined,
    walletAddress: result.walletAddress!,
    _id: result._id,
    username: result.username!,
    isVerified: result.isVerified,
    kycStatus: result.kyc?.status,
    phoneNumber: result.phoneNumber,
  };
};
