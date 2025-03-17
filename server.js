const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.json());

const SECRET_KEY = "secret123";
const users = [
  { id: 1, username: "admin", password: "admin123", role: "admin" },
  { id: 2, username: "user", password: "user123", role: "user" },
];

// Audit function
function auditLog(message) {
  const logMessage = `${new Date().toISOString()} - ${message}\n`;
  fs.appendFileSync("audit.log", logMessage);
}

// Authentication
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    auditLog(`Failed login attempt for username: ${username}`);
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
    expiresIn: "1h",
  });
  auditLog(`User ${username} logged in`);
  res.json({ token });
});

// Authorization middleware
function authorize(roles) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(403).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      if (!roles.includes(decoded.role))
        return res.status(403).json({ message: "Forbidden" });
      req.user = decoded;
      next();
    });
  };
}

app.get("/", (req, res) => {
  res.send("Serverul este activ!");
});

// Protected route (only admin)
app.get("/admin", authorize(["admin"]), (req, res) => {
  auditLog(`Admin access by user ID: ${req.user.id}`);
  res.json({ message: "Welcome, Admin!" });
});

// Protected route (admin & user)
app.get("/user", authorize(["admin", "user"]), (req, res) => {
  auditLog(`User access by user ID: ${req.user.id}`);
  res.json({ message: "Welcome, User!" });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
