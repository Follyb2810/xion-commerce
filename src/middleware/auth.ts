import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import JwtService from "../utils/jwt";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export interface AuthRequest extends Request {
  _id?: string;
  roles?: string[];
}

export const auth: RequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Access denied, no token provided!" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decode = JwtService.verifyToken(token);

    if (!decode || !decode.id || !decode.roles) {
      res.status(403).json({ message: "Invalid token structure" });
      return;
    }

    req._id = decode.id;
    req.roles = decode.roles;

    next(); 
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
    } else if (error instanceof JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
    } else {
      console.error("Unexpected token error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
