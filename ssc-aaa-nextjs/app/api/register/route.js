// app/api/register/route.js

import bcrypt from "bcryptjs";

let users = []; // In-memory users for demo purposes

export async function POST(req) {
  const { email, password } = await req.json();

  // Check if user already exists
  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    return new Response("User already exists", { status: 400 });
  }

  // Hash the password before storing
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save user to in-memory array
  users.push({ email, password: hashedPassword });

  return new Response(
    JSON.stringify({ message: "User created successfully" }),
    { status: 201 }
  );
}
