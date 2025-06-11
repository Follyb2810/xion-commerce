"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskAddress = void 0;
const maskAddress = (address) => {
    let visibleChars = Math.max(2, Math.floor(address.length * 0.2));
    return address.slice(0, visibleChars) + "..." + address.slice(-visibleChars);
};
exports.maskAddress = maskAddress;
console.log((0, exports.maskAddress)("abcdefghuik"));
console.log((0, exports.maskAddress)("0x123456789abcdef123456789abcdef12345678"));
