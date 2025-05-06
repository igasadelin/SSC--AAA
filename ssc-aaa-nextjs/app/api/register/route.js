import speakeasy from "speakeasy"; // Correct import of speakeasy
import { generateQRCode } from "@/lib/2fa"; // Assuming this imports the QR code generation
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request) {
  const { email, password } = await request.json();

  // Check if the email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return new Response(JSON.stringify({ message: "Email already taken" }), {
      status: 400,
    });
  }

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Generate a new secret for 2FA using speakeasy
    const secret = speakeasy.generateSecret(); // This should now work

    // Generate QR code URL for the user
    const qrCodeUrl = await generateQRCode(secret, email);

    // Create new user in the database with the 2FA secret
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        twoFactorSecret: secret.base32, // Save the base32 secret in the DB
      },
    });

    return new Response(
      JSON.stringify({
        message: "User created successfully",
        qrCodeUrl, // Send the QR code URL to the frontend
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
