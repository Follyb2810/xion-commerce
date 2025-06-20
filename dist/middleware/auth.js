"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jwt_1 = __importDefault(require("./../common/libs/jwt"));
const jsonwebtoken_1 = require("jsonwebtoken");
const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Access denied, no token provided!" });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decode = jwt_1.default.verifyToken(token);
        if (!decode || !decode.id || !decode.roles) {
            res.status(403).json({ message: "Invalid token structure" });
            return;
        }
        req._id = decode.id;
        req.roles = decode.roles;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            res.status(401).json({ message: "Token expired" });
        }
        else if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
            res.status(401).json({ message: "Invalid token" });
        }
        else {
            console.error("Unexpected token error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
};
exports.auth = auth;
