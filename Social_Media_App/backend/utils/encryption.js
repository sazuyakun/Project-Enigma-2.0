import CryptoJS from "crypto-js";

const ENCRYPTION_KEY =
  "8d855edef453ed6d7ee03d096de91d88345c604347da8f7fd81ed6d4b7b0009b";

export const encryptText = (text) => {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

export const decryptText = (encryptedText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    return "Error decrypting message";
  }
};