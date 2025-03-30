"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.ResponseHandler = ResponseHandler;
exports.ErrorHandler = ErrorHandler;
function ResponseHandler(res, status, message, data = null) {
    res.status(status).json({
        success: status < 400,
        status,
        message,
        data,
    });
}
exports.AppError = {
    EMAIL_IN_USE: "Email already in use",
    INVALID_CREDENTIALS: "Invalid credentials",
    FILE_ERROR: "No files uploaded",
    TOKEN_EXPIRED: "Token is invalid or has expired",
    FIELD_ERROR: "All fields are required",
    NOT_FOUND: "Resource not found",
    SELLER_AUTH: "Only a seller can perform this action",
    UNAUTHORIZED: "You are not authorized to access this resource",
    CART_NOT_FOUND: "Cart not found",
    PRODUCT_NOT_FOUND: "Product not found",
    PRODUCT_NOT_IN_CART: "Product is not in the cart",
    INVALID_QUANTITY: "Invalid quantity requested",
    INSUFFICIENT_STOCK: "Not enough stock available",
    INVALID_PRODUCT_ID: "Invalid product ID",
    SERVER_ERROR: "Internal server error",
    INVALID_STATUS: "Invalid Product Status",
    EMAIL_PASS_ERROR: "Email and password are required",
    USER_EXIST: "User already exists",
    USER_NOT_FOUND: "User not found",
    INVALID_ROLE: "Invalid role",
    EMPTY_CART: "Your cart is empty",
    MAP_LOCATION: "Mapping location is required",
    INVALID_MAP_LOCATION: "Invalid mapping location",
    TRANSACTION_HASH_REQUIRED: "Transaction Hash is require",
    PURCHASE_FAILED: "Failed to complete payment",
    INVALID_FILE: "Invalid document file or image",
    PRODUCT_DEL: "Cannot delete product with remaining stock",
    XION_BALANCE: "Error fetching balance",
    ERROR_XION: "Error ",
};
function ErrorHandler(res, errorKey, statusCode) {
    const errorMessage = exports.AppError[errorKey] || "An unexpected error occurred";
    console.error(`❌ ErrorHandler Triggered: ${errorKey} (${statusCode}) -> ${errorMessage}`);
    return ResponseHandler(res, statusCode, errorMessage);
}
//? instanceof
//? typeof
//? in
//? is
//?  as
//? keyof
// export interface IApiError {
//     [key: string]: string;
//   }
// export type IApiError = Record<string, string>;
