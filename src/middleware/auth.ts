import express, { Request, Response, NextFunction, RequestHandler } from "express";
import JwtService from "../utils/jwt";

export interface AuthRequest extends Request {
    _id?: string;
    // email?: string;
    roles?: string[];
}

export const auth:RequestHandler = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization ;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Access denied, no token provided!" });
            return; 
        }
        // console.log(authHeader)
        const token = authHeader.split(" ")[1];
        // console.log(token)
        const decode = JwtService.verifyToken(token);
        // console.log(decode)

        if (!decode || !decode.id  || !decode.roles) {
            res.status(403).json({ message: "Invalid token structure" });
            return;
        }

        req._id = decode.id;
        // req.email = decode.email;
        req.roles = decode.roles;

        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid token" });
    }
};

