"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
class MongodbValidate {
    // public static validateCosmosAddress(address: string): boolean {
    //    const regex = /^(cosmos1[a-z0-9]{38}|cosmosvaloper1[a-z0-9]{38})$/;
    //    return regex.test(address) && address.length === 45;
    // }
    static walletValidation() {
        return [
            (0, express_validator_1.body)("walletAddress", "Invalid Wallet Address")
                .matches(/^(cosmos1[a-z0-9]{38}|cosmosvaloper1[a-z0-9]{38})$/),
        ];
    }
}
MongodbValidate.validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};
exports.default = MongodbValidate;
