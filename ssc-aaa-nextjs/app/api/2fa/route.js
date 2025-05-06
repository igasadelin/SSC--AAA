import { generateSecret, generateQRCode } from "@/lib/2fa";
import prisma from "@/lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return new Response(JSON.stringify({ message: "Email is required" }), {
      status: 400,
    });
  }

  // 1. Generate new secret
  const secret = generateSecret(email);

  // 2. Save secret to user
  await prisma.user.update({
    where: { email },
    data: { twoFactorSecret: secret.base32 },
  });

  // 3. Generate QR code URL
  const qrCodeUrl = await generateQRCode(secret, email);

  return new Response(JSON.stringify({ qrCodeUrl }), { status: 200 });
}
