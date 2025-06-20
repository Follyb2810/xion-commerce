"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResponse = void 0;
const UserResponse = (result) => {
    var _a;
    return {
        email: result.email,
        role: result.role,
        profile: result.profile
            ? {
                name: result.profile.name,
                bio: result.profile.bio,
                avatar: result.profile.avatar,
            }
            : undefined,
        walletAddress: result.walletAddress,
        _id: result._id,
        username: result.username,
        isVerified: result.isVerified,
        kycStatus: (_a = result.kyc) === null || _a === void 0 ? void 0 : _a.status,
        phoneNumber: result.phoneNumber,
    };
};
exports.UserResponse = UserResponse;
