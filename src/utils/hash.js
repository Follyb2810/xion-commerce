"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.hmacHash = exports.sha256Hash = exports.decryptedData = exports.encryptedData = exports.privateKey = exports.publicKey = exports.decrypt = exports.encrypt = void 0;
// import crypto from "crypto";
var crypto = require("crypto");
var bcrypt = require("bcrypt");
var algorithm = 'aes-256-cbc';
var key = crypto.randomBytes(32);
var iv = crypto.randomBytes(16);
console.log({ key: key });
console.log({ iv: iv });
function encrypt(value) {
    var cipher = crypto.createCipheriv(algorithm, key, iv);
    console.log({ cipher: cipher });
    var encrypted = cipher.update(value, 'utf-8', 'hex');
    console.log({ encrypted: encrypted });
    encrypted += cipher.final('hex');
    console.log({ encrypted: encrypted });
    console.log({ iv: iv.toString('hex'), encryptedData: encrypted });
    return { iv: iv.toString('hex'), encryptedData: encrypted };
}
exports.encrypt = encrypt;
function decrypt(encryptedData, ivHex) {
    var decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivHex, 'hex'));
    console.log({ decipher: decipher });
    var decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    console.log({ decipher: decipher });
    decrypted += decipher.final('utf8');
    console.log({ decipher: decipher });
    return decrypted;
}
exports.decrypt = decrypt;
// encrypt('follyb')
// const data = encrypt("Hello World");
// console.log("Encrypted:", data);
// console.log({a:data.iv})
// console.log({b:data.encryptedData})
// console.log("Decrypted:", decrypt(data.encryptedData, data.iv));
exports.publicKey = (_a = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
}), _a.publicKey), exports.privateKey = _a.privateKey;
var message = "Hello RSA";
exports.encryptedData = crypto.publicEncrypt(exports.publicKey, Buffer.from(message));
exports.decryptedData = crypto.privateDecrypt(exports.privateKey, exports.encryptedData);
//   console.log("Encrypted:", encryptedData.toString('base64'));
//   console.log("Decrypted:", decryptedData.toString());
//?  sha1  sha512
function sha256Hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}
exports.sha256Hash = sha256Hash;
//   console.log(sha256Hash('Hello World'));
var secret = 'mysecret';
function hmacHash(data) {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
}
exports.hmacHash = hmacHash;
// const original = "follyb";
// const hash = hmacHash(original);
// const isValid = hmacHash("follyb") === hash;
// console.log("Valid?", isValid); 
var password = 'myPassword';
bcrypt.hash(password, 10, function (err, hash) {
    console.log("Hashed:", hash);
    bcrypt.compare(password, hash, function (err, result) {
        // console.log("Password Match:", result);
    });
});
var hashb = bcrypt.hash(password, 10);
console.log({ hashb: hashb.then(function (a) { return console.log(a, 'b'); }) });
