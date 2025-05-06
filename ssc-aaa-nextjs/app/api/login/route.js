import { verifyTOTP } from "@/lib/2fa"; // Adjust the path if necessary
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request) {
  const { email, password, code } = await request.json();

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 400,
    });
  }

  // Check if password is valid
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return new Response(JSON.stringify({ message: "Invalid password" }), {
      status: 400,
    });
  }

  // Verify 2FA code
  const isCodeValid = verifyTOTP(code, user.twoFactorSecret); // Use verifyTOTP here
  if (!isCodeValid) {
    return new Response(JSON.stringify({ message: "Invalid 2FA code" }), {
      status: 400,
    });
  }

  // Proceed with successful login
  return new Response(JSON.stringify({ message: "Login successful" }), {
    status: 200,
  });
}
