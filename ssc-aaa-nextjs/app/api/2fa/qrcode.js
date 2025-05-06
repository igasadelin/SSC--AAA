import speakeasy from "speakeasy";
import QRCode from "qrcode";
import prisma from "@/lib/prisma";

export async function GET(req) {
  const { email } = req.query;

  if (!email) {
    return new Response("Email is required", { status: 400 });
  }

  try {
    // Generate or fetch the 2FA secret from the database
    const secret = speakeasy.generateSecret({ length: 20 }).base32;

    // Save this secret in the database for the user (Optional: to persist it)
    await prisma.user.update({
      where: { email },
      data: { twoFactorSecret: secret },
    });

    const qrCodeUrl = await generateQRCode(secret, email);

    return new Response(JSON.stringify({ qrCodeUrl }), { status: 200 });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return new Response("Error generating QR code", { status: 500 });
  }
}

const generateQRCode = async (secret, email) => {
  const otpauthUrl = speakeasy.otpauthURL({
    secret,
    label: `YourApp:${email}`,
    issuer: "YourApp", // Customize as needed
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
