// import crypto from "crypto";
import * as crypto from "crypto";
import * as bcrypt from "bcrypt";

const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

export function encrypt(value: string) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(value, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return { iv: iv.toString("hex"), encryptedData: encrypted };
}

export function decrypt(encryptedData: string, ivHex: string) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(ivHex, "hex")
  );
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

const message = "Hello RSA";

export const encryptedData = crypto.publicEncrypt(
  publicKey,
  Buffer.from(message)
);
export const decryptedData = crypto.privateDecrypt(privateKey, encryptedData);

//?  sha1  sha512
export function sha256Hash(data: string) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

const secret = "mysecret";

export function hmacHash(data: string) {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

const password = "myPassword";

bcrypt.hash(password, 10, (err, hash) => {
  bcrypt.compare(password, hash, (err, result) => {});
});

export function getKey(userId: string): Buffer {
  return crypto.createHash("sha256").update(userId).digest();
}

export function encryptMemo(text: string, userId: string) {
  const key = getKey(userId);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted,
  };
}

export function decryptMemo(
  encryptedData: string,
  ivHex: string,
  userId: string
) {
  const key = getKey(userId);
  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
//   const { iv, encryptedData } = encrypt('myPassword123', 'user-123');

// const decrypted = decrypt(encryptedData, iv, 'user-123');

export function encryptKey(text: string, userId: string): string {
  const key = getKey(userId);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

export function decryptKey(payload: string, userId: string): string {
  const [ivHex, encryptedData] = payload.split(":");
  const key = getKey(userId);
  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
// const token = encrypt('someSensitiveData', 'user-456');
// // e.g. "3adf90e1b39d4c6c84b4a2a7f22c6c79:c65a8efc0d..."

// const original = decrypt(token, 'user-456');
// // "someSensitiveData"
