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
const User_1 = __importDefault(require("../models/User"));
const IUser_1 = require("../types/IUser");
const repository_1 = __importDefault(require("./repository"));
class UserRepository extends repository_1.default {
    getAllSellersWithKyc() {
        return __awaiter(this, arguments, void 0, function* (limit = 20, skip = 0) {
            const query = { role: IUser_1.Roles.SELLER };
            return this.getAll(undefined, query, [], limit, skip);
        });
    }
    updateKycStatus(userId_1, status_1) {
        return __awaiter(this, arguments, void 0, function* (userId, status, rejectedReason = null) {
            const updateData = {
                'kyc.status': status,
                'kyc.rejectedReason': rejectedReason,
            };
            if (status === IUser_1.KYCStatus.APPROVED) {
                updateData['kyc.verifiedAt'] = new Date();
                updateData['kyc.rejectedReason'] = null;
            }
            else if (status === IUser_1.KYCStatus.REJECTED) {
                updateData['kyc.verifiedAt'] = null;
            }
            else if (status === IUser_1.KYCStatus.NOT_SUBMITTED) {
                updateData['kyc.verifiedAt'] = null;
                updateData['kyc.rejectedReason'] = null;
            }
            return this.updateById(userId, updateData);
        });
    }
}
exports.default = new UserRepository(User_1.default);
