"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jwt_1 = __importDefault(require("../utils/jwt"));
const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Access denied, no token provided!" });
            return;
        }
        // console.log(authHeader)
        const token = authHeader.split(" ")[1];
        // console.log(token)
        const decode = jwt_1.default.verifyToken(token);
        // console.log(decode)
        if (!decode || !decode.id || !decode.roles) {
            res.status(403).json({ message: "Invalid token structure" });
            return;
        }
        req._id = decode.id;
        // req.email = decode.email;
        req.roles = decode.roles;
        next();
    }
    catch (error) {
        res.status(403).json({ message: "Invalid token" });
    }
};
exports.auth = auth;
