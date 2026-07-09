const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const generateUUID = () => {
  return uuidv4();
};

const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

const hashData = (data, algorithm = 'sha256') => {
  return crypto.createHash(algorithm).update(data).digest('hex');
};

const encryptData = (data, secretKey) => {
  const algorithm = 'aes-256-cbc';
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
  };
};

const decryptData = (encryptedData, iv, secretKey) => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, 'hex')
  );
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

const generateSecureToken = (prefix = '') => {
  const randomPart = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now().toString(36);
  return `${prefix}${randomPart}${timestamp}`.toUpperCase();
};

const verifyHash = (data, hash, algorithm = 'sha256') => {
  const computedHash = hashData(data, algorithm);
  return crypto.timingSafeEqual(
    Buffer.from(computedHash, 'hex'),
    Buffer.from(hash, 'hex')
  );
};

const generateSignature = (data, secretKey) => {
  return crypto
    .createHmac('sha256', secretKey)
    .update(JSON.stringify(data))
    .digest('hex');
};

const verifySignature = (data, signature, secretKey) => {
  const expectedSignature = generateSignature(data, secretKey);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

module.exports = {
  generateUUID,
  generateRandomString,
  generateOTP,
  hashData,
  encryptData,
  decryptData,
  generateSecureToken,
  verifyHash,
  generateSignature,
  verifySignature,
};