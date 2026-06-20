const QRCode = require('qrcode');

/**
 * Generate QR code as base64 data URL
 */
const generateQRCodeBase64 = async (data) => {
  try {
    const qrDataURL = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
    return qrDataURL;
  } catch (err) {
    throw new Error(`QR code generation failed: ${err.message}`);
  }
};

/**
 * Generate QR code as SVG string
 */
const generateQRCodeSVG = async (data) => {
  try {
    return await QRCode.toString(data, { type: 'svg', errorCorrectionLevel: 'H' });
  } catch (err) {
    throw new Error(`QR SVG generation failed: ${err.message}`);
  }
};

/**
 * Build QR payload for a redemption
 */
const buildRedemptionQRPayload = (redemption) => {
  return JSON.stringify({
    code: redemption.redemptionCode,
    voucher: redemption.voucherSnapshot?.title,
    user: redemption.user,
    expires: redemption.expiresAt,
  });
};

module.exports = { generateQRCodeBase64, generateQRCodeSVG, buildRedemptionQRPayload };
