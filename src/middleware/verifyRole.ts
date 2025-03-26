import { NextFunction, Request, RequestHandler, Response } from "express";
import { AuthRequest } from "./auth";

export const verifyRole = (...allowRoles: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest; 
    const userRoles: string[] | undefined = authReq.roles;
    
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
