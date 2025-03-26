import { IUser } from "./IUser";

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
        username: result.username!
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
    username: string | null;
}

interface IProfile {
    name: null | string;
    bio: null | string;
    avatar: null | string;
}
