// import crypto from "crypto";
import * as crypto from "crypto";
import * as bcrypt  from 'bcrypt';

const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32); 
const iv = crypto.randomBytes(16);  
// console.log({key}) 
// console.log({iv})


export function encrypt(value:string){
    const cipher = crypto.createCipheriv(algorithm,key,iv)
    // console.log({cipher})
    let encrypted = cipher.update(value,'utf-8','hex')
    // console.log({encrypted})
    encrypted += cipher.final('hex')
    // console.log({encrypted})
    // console.log({iv: iv.toString('hex'), encryptedData: encrypted})
    return { iv: iv.toString('hex'), encryptedData: encrypted}
}

export function decrypt(encryptedData : string, ivHex :string) {
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

export const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  
  const message = "Hello RSA";
  
  export const encryptedData = crypto.publicEncrypt(publicKey, Buffer.from(message));
  export const decryptedData = crypto.privateDecrypt(privateKey, encryptedData);
  
//   console.log("Encrypted:", encryptedData.toString('base64'));
//   console.log("Decrypted:", decryptedData.toString());
  
  //?  sha1  sha512
  export function sha256Hash(data : string) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
//   console.log(sha256Hash('Hello World'));

const secret = 'mysecret';

export function hmacHash(data:string){ 
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


export function getKey(userId: string): Buffer {
    return crypto.createHash('sha256').update(userId).digest(); 
  }
  
  export function encryptMemo(text: string, userId: string) {
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

  export function decryptMemo(encryptedData: string, ivHex: string, userId: string) {
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

export function encryptKey(text: string, userId: string): string {
  const key = getKey(userId);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptKey(payload: string, userId: string): string {
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
