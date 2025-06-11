"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_repository_1 = __importDefault(require("./user.repository"));
const IUser_1 = require("./../../common/types/IUser");
const bcrypt_1 = require("./../../utils/bcrypt");
const jwt_1 = __importDefault(require("./../../utils/jwt"));
const crypto_1 = __importDefault(require("crypto"));
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    registerUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (email.toLowerCase() === "superadmin@chaincart.com") {
                throw new Error("USER_EXIST");
            }
            const existingUser = yield this.userRepository.findByEntity({ email });
            if (existingUser) {
                throw new Error("USER_EXIST");
            }
            const hashedPassword = yield (0, bcrypt_1.hashPwd)(password);
            const newUser = yield this.userRepository.create({
                email,
                password: hashedPassword,
            });
            newUser.refreshToken = crypto_1.default.randomBytes(40).toString("hex");
            if (!newUser.role.includes(IUser_1.Roles.SELLER)) {
                newUser.role.push(IUser_1.Roles.SELLER);
            }
            yield newUser.save();
            return newUser;
        });
    }
    loginUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findByEntity({ email });
            if (!user || !(yield (0, bcrypt_1.ComparePassword)(password, user.password))) {
                throw new Error("INVALID_CREDENTIALS");
            }
            user.refreshToken = crypto_1.default.randomBytes(40).toString("hex");
            yield user.save();
            return user;
        });
    }
    generateAccessToken(userId, roles) {
        return __awaiter(this, void 0, void 0, function* () {
            return jwt_1.default.signToken({
                id: userId,
                roles: roles,
            });
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findById(id);
        });
    }
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.getAll();
        });
    }
    verifyUserAsSeller(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findById(id);
            if (!user) {
                throw new Error("USER_NOTFOUND");
            }
            yield this.userRepository.updateOne({ _id: id }, { $addToSet: { role: IUser_1.Roles.SELLER } });
        });
    }
    removeUserRole(id, role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Object.values(IUser_1.Roles).includes(role)) {
                throw new Error("INVALID_ROLE");
            }
            const user = yield this.userRepository.findById(id);
            if (!user) {
                throw new Error("USER_NOTFOUND");
            }
            yield this.userRepository.updateOne({ _id: id }, { $pull: { role } });
        });
    }
    updateUserProfile(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, phoneNumber, name } = updates;
            if (!email && !phoneNumber && !name) {
                throw new Error("NO_DATA_PROVIDED");
            }
            const user = yield this.userRepository.findById(id);
            if (!user) {
                throw new Error("USER_NOTFOUND");
            }
            const normalizedEmail = email === null || email === void 0 ? void 0 : email.trim().toLowerCase();
            if (normalizedEmail && normalizedEmail !== user.email) {
                const emailTaken = yield this.userRepository.findByEntity({
                    email: normalizedEmail,
                });
                const isEmailUsedByAnotherUser = emailTaken && emailTaken._id.toString() !== user._id.toString();
                if (isEmailUsedByAnotherUser) {
                    throw new Error("USER_EXIST");
                }
            }
            const profileUpdates = {};
            if (normalizedEmail)
                profileUpdates.email = normalizedEmail;
            if (phoneNumber)
                profileUpdates.phoneNumber = phoneNumber;
            if (name) {
                profileUpdates.profile = Object.assign(Object.assign({}, user.profile), { name });
            }
            yield this.userRepository.updateById(id, profileUpdates);
        });
    }
    getUserByWalletAddress(walletAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findByEntity({ walletAddress }, "email phoneNumber profile.name");
        });
    }
    updateKycStatus(userId, status, rejectedReason) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.updateKycStatus(userId, status, rejectedReason);
        });
    }
    getAllSellersWithKyc() {
        return __awaiter(this, arguments, void 0, function* (limit = 20, skip = 0) {
            return yield this.userRepository.getAllSellersWithKyc(limit, skip);
        });
    }
    authWallet(walletAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!walletAddress) {
                throw new Error("Wallet address is required");
            }
            let user = yield this.userRepository.findByEntity({ walletAddress });
            if (!user) {
                user = yield this.userRepository.create({
                    walletAddress,
                });
                user.refreshToken = crypto_1.default.randomBytes(40).toString("hex");
                // if (!user.role.includes(Roles.SELLER)) {
                //   user.role.push(Roles.SELLER);
                //   await user.save();
                // }
                yield user.save();
            }
            return user;
        });
    }
    updateProfileWithWallet(updateProfile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!updateProfile.userId) {
                throw new Error("UNAUTHORIZED");
            }
            const user = yield this.userRepository.findById(updateProfile.userId);
            if (!user) {
                throw new Error('USER_NOT_FOUND');
            }
            if (updateProfile.email && user.email) {
                throw new Error("You cannot change your email");
            }
            if (updateProfile.walletAddress &&
                updateProfile.walletAddress !== user.walletAddress) {
                const existingUser = yield this.userRepository.findByEntity({
                    walletAddress: updateProfile.walletAddress,
                });
                if (existingUser) {
                    throw new Error("Wallet address is already in use");
                }
                if (!user.email) {
                    throw new Error("You must add an email before changing your wallet address");
                }
                user.walletAddress = updateProfile.walletAddress;
            }
            if (updateProfile.username)
                user.username = updateProfile.username;
            user.profile = user.profile || {};
            if (updateProfile.name)
                user.profile.name = updateProfile.name;
            if (updateProfile.bio)
                user.profile.bio = updateProfile.bio;
            if (updateProfile.avatar)
                user.profile.avatar = updateProfile.avatar;
            yield user.save();
            return user;
        });
    }
}
exports.default = new UserService(user_repository_1.default);
