// app/api/login/route.js
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request) {
  const { email, password } = await request.json();

  // Find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return new Response(
      JSON.stringify({ message: "Invalid email or password" }),
      { status: 400 }
    );
  }

  // Compare the hashed password
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return new Response(
      JSON.stringify({ message: "Invalid email or password" }),
      { status: 400 }
    );
  }

  // For a successful login, you can return a token, user details, etc.
  return new Response(JSON.stringify({ message: "Login successful", user }), {
    status: 200,
  });
}
