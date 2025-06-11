"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KYCStatus = exports.Roles = void 0;
var Roles;
(function (Roles) {
    Roles["BUYER"] = "buyer";
    Roles["SELLER"] = "seller";
    Roles["ADMIN"] = "admin";
    Roles["SUPERADMIN"] = "superadmin";
})(Roles || (exports.Roles = Roles = {}));
var KYCStatus;
(function (KYCStatus) {
    KYCStatus["NOT_SUBMITTED"] = "not_submitted";
    KYCStatus["PENDING"] = "pending";
    KYCStatus["APPROVED"] = "approved";
    KYCStatus["REJECTED"] = "rejected";
})(KYCStatus || (exports.KYCStatus = KYCStatus = {}));
