import { IUser, KYCStatus } from "./IUser";

export type IResponse<T> = {
    data: T;
    message?: string;
};

export const UserResponse = (result: IUser): IUserDto => {
    return {
        email: result.email!,
        role: result.role,
        profile: result.profile ? {
            name: result.profile.name!,
            bio: result.profile.bio!,
            avatar: result.profile.avatar!,
        } : undefined, 
        walletAddress: result.walletAddress!,
        _id: result._id,
        username: result.username!,
        isVerified: result.isVerified,
        kycStatus:result.kyc?.status,
        phoneNumber:result.phoneNumber,
    };
};

export interface IUserResponse {
    accessToken: string;
    user: IUserDto;
}

interface IUserDto {
    email: string | null;
    role: string[];
    profile?: IProfile;
    walletAddress: null | string;
    _id: string;
    phoneNumber?: string;
    username: string | null;
    isVerified?: boolean;
    kycStatus?:KYCStatus


}

interface IProfile {
    name: null | string;
    bio: null | string;
    avatar: null | string;
}
