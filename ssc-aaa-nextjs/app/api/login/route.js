// app/api/login/route.js

import bcrypt from "bcryptjs";
import { users } from "../../utils/users";

export async function POST(req) {
  const { email, password } = await req.json();

  // Find the user by email
  const user = users.find((user) => user.email === email);
  if (!user) {
    return new Response("Invalid email or password", { status: 401 });
  }

  // Compare entered password with the stored hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return new Response("Invalid email or password", { status: 401 });
  }

  return new Response("Login successful", { status: 200 });
}
