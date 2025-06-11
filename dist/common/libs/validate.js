"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateApiRequest = validateApiRequest;
const express_validator_1 = require("express-validator");
function validateApiRequest(req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}
;
// cosmos1rs2tnhe4mxpjnedhc84pc0v7mcy5gtmga0a9n3
// neutron1rs2tnhe4mxpjnedhc84pc0v7mcy5gtmges58fk
class ValidateRequest {
    // static validateCosmosAddress(address: string): boolean {
    //     const regex = /^(cosmos1[a-z0-9]{38}|cosmosvaloper1[a-z0-9]{38})$/;
    //     return regex.test(address) && address.length === 45;
    // }
    static validateWalletAuth() {
        return [
            (0, express_validator_1.body)("walletAddress").notEmpty().withMessage("wallet address is required")
        ];
    }
    static validateUserAuth() {
        return [
            (0, express_validator_1.body)('email').isEmail().bail().notEmpty().isEmpty().withMessage('email is required'),
            (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
        ];
    }
    static validateMiddleware(req, res, next) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        return res.status(400).json({ errors: errors.array() });
    }
}
// param('id').customSanitizer(value => ObjectId(value))
// body('password').isLength({ min: 5 }),
// body('passwordConfirmation').custom((value, { req }) => {
//   return value === req.body.password;
// }),
// const registerValidator = [
//     body("name").notEmpty().withMessage("Name is required"),
//     body("email")
//       .isEmail()
//       .withMessage("Invalid email address")
//       .custom(async (value) => {
//         const existingUser = await User.findOne({ email: value });
//         if (existingUser) {
//           return Promise.reject("Email is already in use");
//         }
//         return true;
//       }),
//     body("age").optional({ nullable: true }).isInt().withMessage("Invalid age"),
//     body("password").notEmpty().withMessage("Password is required"),
//   ];
// const loginValidator = [
//     body("email").isEmail().withMessage("Invalid email address"),
//     body("password").notEmpty().withMessage("Password is required"),
//   ];
// const getUserValidator = [
//     param("objectId").isMongoId().withMessage("Invalid objectId"),
//   ];
//   const getAllUsersValidator = [
//     query("page").optional().isInt({ min: 1 }).withMessage("Invalid page number"),
//     query("limit")
//       .optional()
//       .isInt({ min: 1, max: 100 })
//       .withMessage("Invalid limit value"),
//   ];
//   const validate = (req, res, next) => {
// const errors = validationResult(req);
// if (errors.isEmpty()) {
//   return next();
// }
// return res.status(400).json({ errors: errors.array() });
//   };
// const addItemToCartValidator = [
//   body("productId").notEmpty().withMessage("Product ID is required"),
//   body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
// ];
// const addProductValidator = [
//     body("title").notEmpty().withMessage("Title is required"),
//     body("description").notEmpty().withMessage("Description is required"),
//     body("category").notEmpty().withMessage("Category is required"),
//     body("price").isNumeric().withMessage("Price must be a number"),
//     body("image").notEmpty().withMessage("Image is required"),
//   ];
//   const editProductValidator = [
//     param("objectId").notEmpty().withMessage("Product ID is required"),
//     ...addProductValidator,
//   ];
