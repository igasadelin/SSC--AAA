import speakeasy from "speakeasy";
import QRCode from "qrcode";

/**
 * Generate a TOTP secret for a user based on their email.
 * @param {string} email
 * @returns {object} speakeasy secret object
 */
export const generateSecret = (email) => {
  return speakeasy.generateSecret({
    name: `YourApp:${email}`, // Replace "YourApp" with your real app name
    issuer: "YourApp",
  });
};

/**
 * Generate a QR code data URL from a TOTP secret.
 * @param {object} secret - speakeasy secret object
 * @param {string} email
 * @returns {Promise<string>} base64 image URL
 */
export const generateQRCode = async (secret, email) => {
  const otpauthUrl = speakeasy.otpauthURL({
    secret: secret.base32,
    label: `YourApp:${email}`, // Match label with what user sees in Authenticator app
    issuer: "YourApp",
    encoding: "base32",
  });

  try {
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);
    return qrCodeUrl;
  } catch (error) {
    console.error("QR Code generation failed:", error);
    throw error;
  }
};

/**
 * Verify a TOTP code against the stored secret.
 * @param {string} token - the 6-digit code from user's Authenticator app
 * @param {string} secret - base32 TOTP secret
 * @returns {boolean} true if valid, false otherwise
 */
export const verifyTOTP = (token, secret) => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1, // slight tolerance for clock drift
  });
};
