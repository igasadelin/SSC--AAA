// utils/users.js
import bcrypt from "bcryptjs";

// Pre-hash the password so it can be used for comparison in login
const hashedPassword = bcrypt.hashSync("demo123", 10);

export const users = [
  {
    id: 1,
    email: "test@example.com",
    password: hashedPassword,
  },
];
