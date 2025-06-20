"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
class JwtService {
    constructor() { }
    static getSecret() {
        if (!this.secret) {
            this.secret = process.env.JWT_SECRET;
            if (!this.secret) {
                throw new Error("JWT_SECRET is not defined. Make sure it is set in the environment variables.");
            }
        }
        return this.secret;
    }
    static signToken(payload, expiresIn = "1h") {
        try {
            return (0, jsonwebtoken_1.sign)(payload, this.getSecret(), { expiresIn });
        }
        catch (error) {
            throw error;
        }
    }
    static verifyToken(token) {
        try {
            return (0, jsonwebtoken_1.verify)(token, this.getSecret());
        }
        catch (error) {
            throw error;
        }
    }
}
JwtService.secret = null;
exports.default = JwtService;
