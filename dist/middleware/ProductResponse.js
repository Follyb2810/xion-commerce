"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatProductResponse = void 0;
const formatProductResponse = (product, seller, quantity) => {
    console.log(product);
    console.log(seller);
    console.log(quantity);
    return {
        productId: product._id,
        quantity,
        price: product.price,
        totalAmount: product.price * quantity,
        seller: seller._id,
        sellerAddress: seller.walletAddress
    };
};
exports.formatProductResponse = formatProductResponse;
