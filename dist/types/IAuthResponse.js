"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResponse = void 0;
const UserResponse = (result) => {
    return {
        email: result.email,
        role: result.role,
        profile: result.profile ? {
            name: result.profile.name,
            bio: result.profile.bio,
            avatar: result.profile.avatar,
        } : undefined,
        walletAddress: result.walletAddress,
        _id: result._id,
        username: result.username,
        isVerified: result.isVerified
    };
};
exports.UserResponse = UserResponse;
