"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRole = void 0;
const verifyRole = (...allowRoles) => {
    return (req, res, next) => {
        const authReq = req;
        const userRoles = authReq.roles;
        if (!userRoles || !Array.isArray(userRoles)) {
            res.status(403).json({
                message: "Access denied: No roles found or invalid roles format.",
            });
            return;
        }
        const hasPermission = userRoles.some((role) => allowRoles.includes(role));
        if (!hasPermission) {
            res.status(403).json({
                message: "Access denied: Insufficient privileges.",
            });
            return;
        }
        next();
    };
};
exports.verifyRole = verifyRole;
