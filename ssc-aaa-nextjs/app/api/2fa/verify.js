import { verifyTOTP } from "@/lib/2fa";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ message: "Missing email or code" }),
        {
          status: 400,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.twoFactorSecret) {
      return new Response(
        JSON.stringify({ message: "User not found or 2FA not setup" }),
        { status: 400 }
      );
    }

    const isValid = verifyTOTP(code, user.twoFactorSecret);

    if (!isValid) {
      return new Response(JSON.stringify({ message: "Invalid 2FA code" }), {
        status: 401,
      });
    }

    // TODO: Set session or JWT if needed here

    return new Response(JSON.stringify({ message: "2FA verified" }), {
      status: 200,
    });
  } catch (error) {
    console.error("2FA verification error:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
