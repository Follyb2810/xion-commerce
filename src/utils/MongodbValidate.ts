import { Request, Response, NextFunction, RequestHandler } from "express";
import { body, validationResult } from "express-validator";

class MongodbValidate {
      // public static validateCosmosAddress(address: string): boolean {
      //    const regex = /^(cosmos1[a-z0-9]{38}|cosmosvaloper1[a-z0-9]{38})$/;
      //    return regex.test(address) && address.length === 45;
      // }
   
      public static walletValidation(): RequestHandler[] {
         return [
            body("walletAddress", "Invalid Wallet Address")
               .matches(/^(cosmos1[a-z0-9]{38}|cosmosvaloper1[a-z0-9]{38})$/),
         ];
      }
   
      public static validateRequest: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
         }
         next();
      };
   }
   

export default MongodbValidate;
