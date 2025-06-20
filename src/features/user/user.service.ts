import UserRepository from "./user.repository";
import { IUser, Roles, KYCStatus } from "./../../common/types/IUser";
import { hashPwd, ComparePassword } from "./../../common/libs/bcrypt";
import JwtService from "./../../common/libs/jwt";
import crypto from "crypto";

type IUserWallet = {
  walletAddress: string;
  email: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  userId: string;
};
class UserService {
  constructor(private userRepository: typeof UserRepository) {}

  async registerUser(email: string, password: string) {
    if (email.toLowerCase() === "superadmin@chaincart.com") {
      throw new Error("USER_EXIST");
    }

    const existingUser = await this.userRepository.findByEntity({ email });
    if (existingUser) {
      throw new Error("USER_EXIST");
    }

    const hashedPassword = await hashPwd(password);
    const newUser = await this.userRepository.create({
      email,
      password: hashedPassword,
    } as Partial<IUser>);

    newUser.refreshToken = crypto.randomBytes(40).toString("hex");

    if (!newUser.role.includes(Roles.SELLER)) {
      newUser.role.push(Roles.SELLER);
    }

    await newUser.save();
    return newUser;
  }

  async loginUser(email: string, password: string) {
    const user = await this.userRepository.findByEntity({ email });
    if (!user || !(await ComparePassword(password, user.password!))) {
      throw new Error("INVALID_CREDENTIALS");
    }
    user.refreshToken = crypto.randomBytes(40).toString("hex");
    await user.save();

    return user;
  }

  async generateAccessToken(userId: string, roles: string[]) {
    return JwtService.signToken({
      id: userId,
      roles: roles,
    });
  }

  async getUserById(id: string) {
    return await this.userRepository.findById(id);
  }

  async getAllUsers() {
    return await this.userRepository.getAll();
  }

  async verifyUserAsSeller(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error("USER_NOTFOUND");
    }

    await this.userRepository.updateOne(
      { _id: id },
      { $addToSet: { role: Roles.SELLER } }
    );
  }
async updateUserRole(
  id: string,
  role: string,
  action: "add" | "remove" = "add"
) {
  const normalizedRole = role.toLowerCase() as Roles;
  const normalizedAction = action.toLowerCase();

  if (!Object.values(Roles).includes(normalizedRole)) {
    throw new Error("INVALID_ROLE");
  }

  const user = await this.userRepository.findById(id);
  if (!user) {
    throw new Error("USER_NOTFOUND");
  }

  if (normalizedAction === "add") {
    if (user.role.includes(normalizedRole)) {
      throw new Error("ROLE_ALREADY_ASSIGNED");
    }

    if (normalizedRole === Roles.SUPERADMIN) {
      const existingSuperAdmin = await this.userRepository.findByEntity({
        role: Roles.SUPERADMIN,
      });
      if (existingSuperAdmin) {
        throw new Error("ONLY_ONE_SUPERADMIN_ALLOWED");
      }
    }

    await this.userRepository.updateOne(
      { _id: id },
      { $push: { role: normalizedRole } }
    );
  }

  if (normalizedAction === "remove") {
    if (!user.role.includes(normalizedRole)) {
      throw new Error("ROLE_NOT_ASSIGNED");
    }
    if (
      normalizedRole === Roles.BUYER &&
      user.role.length === 1 &&
      user.role[0] === Roles.BUYER
    ) {
      throw new Error("CANNOT_REMOVE_SOLE_BUYER_ROLE");
    }

    if (normalizedRole === Roles.SUPERADMIN) {
      const allSuperAdmins = await this.userRepository.getAll(undefined,{
        role: Roles.SUPERADMIN,
      });
      if (
        allSuperAdmins.length === 1 &&
        allSuperAdmins[0]._id.toString() === id
      ) {
        throw new Error("CANNOT_REMOVE_LAST_SUPERADMIN");
      }
    }

    await this.userRepository.updateOne(
      { _id: id },
      { $pull: { role: normalizedRole } }
    );
  }
}



  async updateUserProfile(
    id: string,
    updates: {
      email?: string;
      phoneNumber?: string;
      name?: string;
    }
  ) {
    const { email, phoneNumber, name } = updates;

    if (!email && !phoneNumber && !name) {
      throw new Error("NO_DATA_PROVIDED");
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error("USER_NOTFOUND");
    }

    const normalizedEmail = email?.trim().toLowerCase();

    if (normalizedEmail && normalizedEmail !== user.email) {
      const emailTaken = await this.userRepository.findByEntity({
        email: normalizedEmail,
      });

      const isEmailUsedByAnotherUser =
        emailTaken && emailTaken._id.toString() !== user._id.toString();

      if (isEmailUsedByAnotherUser) {
        throw new Error("USER_EXIST");
      }
    }

    const profileUpdates: Partial<IUser> = {};
    if (normalizedEmail) profileUpdates.email = normalizedEmail;
    if (phoneNumber) profileUpdates.phoneNumber = phoneNumber;
    if (name) {
      profileUpdates.profile = {
        ...user.profile,
        name,
      };
    }

    await this.userRepository.updateById(id, profileUpdates);
  }

  async getUserByWalletAddress(walletAddress: string) {
    return await this.userRepository.findByEntity(
      { walletAddress },
      "email phoneNumber profile.name"
    );
  }

  async updateKycStatus(
    userId: string,
    status: KYCStatus,
    rejectedReason?: string
  ) {
    return await this.userRepository.updateKycStatus(
      userId,
      status,
      rejectedReason
    );
  }

  async getAllSellersWithKyc(limit = 20, skip = 0) {
    return await this.userRepository.getAllSellersWithKyc(limit, skip);
  }
  async authWallet(walletAddress: string) {
    if (!walletAddress) {
      throw new Error("Wallet address is required");
    }
    let user = await this.userRepository.findByEntity({ walletAddress });

    if (!user) {
      user = await this.userRepository.create({
        walletAddress,
      });
      user.refreshToken = crypto.randomBytes(40).toString("hex");
      // if (!user.role.includes(Roles.SELLER)) {
      //   user.role.push(Roles.SELLER);
      //   await user.save();
      // }
      await user.save();
    }
    return user;
  }
  async updateProfileWithWallet(updateProfile: IUserWallet) {
    if (!updateProfile.userId) {
      throw new Error("UNAUTHORIZED");
    }

    const user = await this.userRepository.findById(updateProfile.userId);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    if (updateProfile.email && user.email) {
      throw new Error("You cannot change your email");
    }

    if (
      updateProfile.walletAddress &&
      updateProfile.walletAddress !== user.walletAddress
    ) {
      const existingUser = await this.userRepository.findByEntity({
        walletAddress: updateProfile.walletAddress,
      });
      if (existingUser) {
        throw new Error("Wallet address is already in use");
      }

      if (!user.email) {
        throw new Error(
          "You must add an email before changing your wallet address"
        );
      }

      user.walletAddress = updateProfile.walletAddress;
    }

    if (updateProfile.username) user.username = updateProfile.username;

    user.profile = user.profile || {};

    if (updateProfile.name) user.profile.name = updateProfile.name;
    if (updateProfile.bio) user.profile.bio = updateProfile.bio;
    if (updateProfile.avatar) user.profile.avatar = updateProfile.avatar;

    await user.save();
    return user;
  }
}

export default new UserService(UserRepository);
