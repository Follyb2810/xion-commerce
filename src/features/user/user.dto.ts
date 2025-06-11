import { IUser, KYCStatus } from "./../../common/types/IUser";

export type IResponse<T> = {
  data: T;
  message?: string;
};

export interface IUserResponse {
  accessToken: string;
  user: IUserDto;
}

export interface IUserDto {
  email: string | null;
  role: string[];
  profile?: IProfile;
  walletAddress: null | string;
  _id: string;
  phoneNumber?: string;
  username: string | null;
  isVerified?: boolean;
  kycStatus?: KYCStatus;
}

interface IProfile {
  name: null | string;
  bio: null | string;
  avatar: null | string;
}
