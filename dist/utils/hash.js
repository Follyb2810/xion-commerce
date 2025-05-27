"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptedData = exports.encryptedData = exports.privateKey = exports.publicKey = void 0;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.sha256Hash = sha256Hash;
exports.hmacHash = hmacHash;
exports.getKey = getKey;
exports.encryptMemo = encryptMemo;
exports.decryptMemo = decryptMemo;
exports.encryptKey = encryptKey;
exports.decryptKey = decryptKey;
// import crypto from "crypto";
const crypto = __importStar(require("crypto"));
const bcrypt = __importStar(require("bcrypt"));
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
// console.log({key}) 
// console.log({iv})
function encrypt(value) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    // console.log({cipher})
    let encrypted = cipher.update(value, 'utf-8', 'hex');
    // console.log({encrypted})
    encrypted += cipher.final('hex');
    // console.log({encrypted})
    // console.log({iv: iv.toString('hex'), encryptedData: encrypted})
    return { iv: iv.toString('hex'), encryptedData: encrypted };
}
function decrypt(encryptedData, ivHex) {
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivHex, 'hex'));
    // console.log({decipher})
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    // console.log({decipher})
    decrypted += decipher.final('utf8');
    // console.log({decipher})
    return decrypted;
}
// encrypt('follyb')
// const data = encrypt("Hello World");
// console.log("Encrypted:", data);
// console.log({a:data.iv})
// console.log({b:data.encryptedData})
// console.log("Decrypted:", decrypt(data.encryptedData, data.iv));
_a = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
}), exports.publicKey = _a.publicKey, exports.privateKey = _a.privateKey;
const message = "Hello RSA";
exports.encryptedData = crypto.publicEncrypt(exports.publicKey, Buffer.from(message));
exports.decryptedData = crypto.privateDecrypt(exports.privateKey, exports.encryptedData);
//   console.log("Encrypted:", encryptedData.toString('base64'));
//   console.log("Decrypted:", decryptedData.toString());
//?  sha1  sha512
function sha256Hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}
//   console.log(sha256Hash('Hello World'));
const secret = 'mysecret';
function hmacHash(data) {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
}
// const original = "follyb";
// const hash = hmacHash(original);
// const isValid = hmacHash("follyb") === hash;
// console.log("Valid?", isValid); 
const password = 'myPassword';
bcrypt.hash(password, 10, (err, hash) => {
    //   console.log("Hashed:", hash);
    bcrypt.compare(password, hash, (err, result) => {
        // console.log("Password Match:", result);
    });
});
// const hashb = bcrypt.hash(password,10)
// console.log({hashb:hashb.then(a=>console.log(a,'b'))})
// const argon2 = require('argon2');
// (async () => {
//     const hash = await argon2.hash("myPassword");
//     console.log("Argon2 Hash:", hash);
//     const isMatch = await argon2.verify(hash, "myPassword");
//     console.log("Password Match:", isMatch);
//   })();
function getKey(userId) {
    return crypto.createHash('sha256').update(userId).digest();
}
function encryptMemo(text, userId) {
    const key = getKey(userId);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted,
    };
}
function decryptMemo(encryptedData, ivHex, userId) {
    const key = getKey(userId);
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
//   const { iv, encryptedData } = encrypt('myPassword123', 'user-123');
// console.log({ encryptedData, iv });
// const decrypted = decrypt(encryptedData, iv, 'user-123');
// console.log({ decrypted });
function encryptKey(text, userId) {
    const key = getKey(userId);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}
function decryptKey(payload, userId) {
    const [ivHex, encryptedData] = payload.split(':');
    const key = getKey(userId);
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
// const token = encrypt('someSensitiveData', 'user-456');
// console.log(token); 
// // e.g. "3adf90e1b39d4c6c84b4a2a7f22c6c79:c65a8efc0d..."
// const original = decrypt(token, 'user-456');
// console.log(original); 
// // "someSensitiveData"
