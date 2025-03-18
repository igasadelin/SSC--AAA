const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const app = express();
const PORT = 3000;

app.use(express.json()); // Middleware pentru a permite interpretarea JSON-ului în request-uri

const SECRET_KEY = "secret123"; // Cheie secretă folosită pentru semnarea token-urilor JWT

// Simulăm o bază de date cu utilizatori
let users = [
  { id: 1, username: "admin", password: "admin123", role: "admin", secret: null },
  { id: 2, username: "user", password: "user123", role: "user", secret: null },
];

// Funcție pentru log-uri de audit
function auditLog(message) {
  const logMessage = `${new Date().toISOString()} - ${message}\n`;
  fs.appendFileSync("audit.log", logMessage); // Salvează mesajele de audit în fișierul "audit.log"
}

// Endpoint pentru configurarea autentificării 2FA
app.post("/setup-2fa", (req, res) => {
  const { username } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Generează o cheie secretă pentru utilizator
  const secret = speakeasy.generateSecret({ length: 20 });
  user.secret = secret.base32;

  // Generăm un cod QR pentru scanare în aplicația 2FA
  qrcode.toDataURL(secret.otpauth_url, (err, imageUrl) => {
    if (err) return res.status(500).json({ message: "QR generation error" });
    
    auditLog(`2FA setup for user: ${username}`); // Logăm setup-ul 2FA
    res.json({ qrCode: imageUrl, secret: secret.base32 }); // Returnăm QR code-ul și cheia secretă
  });
});

// Endpoint de login cu 2FA
app.post("/login", (req, res) => {
  const { username, password, otp } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);
  
  if (!user) {
    auditLog(`Failed login attempt for username: ${username}`); // Logăm tentativa eșuată
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (!user.secret) return res.status(400).json({ message: "2FA not set up" });

  // Verificăm codul OTP introdus
  const isValid = speakeasy.totp.verify({
    secret: user.secret,
    encoding: "base32",
    token: otp,
    window: 1, // Permitem o mică variație de timp
  });

  if (!isValid) {
    auditLog(`Failed 2FA attempt for username: ${username}`); // Logăm tentativa eșuată 2FA
    return res.status(401).json({ message: "Invalid OTP" });
  }

  // Creăm un token JWT
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

  auditLog(`User ${username} logged in`); // Logăm autentificarea reușită
  res.json({ token }); // Returnăm token-ul JWT
});

// Middleware pentru autorizare în funcție de roluri
function authorize(roles) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(403).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    
    // Verificăm validitatea token-ului JWT
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      
      // Verificăm dacă utilizatorul are acces la această resursă
      if (!roles.includes(decoded.role)) return res.status(403).json({ message: "Forbidden" });

      req.user = decoded; // Salvăm detaliile utilizatorului în request
      next(); // Continuăm execuția request-ului
    });
  };
}

// Endpoint de test pentru verificarea funcționării serverului
app.get("/", (req, res) => res.send("Serverul este activ!"));

// Endpoint accesibil doar pentru admini
app.get("/admin", authorize(["admin"]), (req, res) => {
  auditLog(`Admin access by user ID: ${req.user.id}`); // Logăm accesul la ruta de admin
  res.json({ message: "Welcome, Admin!" });
});

// Endpoint accesibil atât pentru admini, cât și pentru utilizatori
app.get("/user", authorize(["admin", "user"]), (req, res) => {
  auditLog(`User access by user ID: ${req.user.id}`); // Logăm accesul la ruta de utilizator
  res.json({ message: "Welcome, User!" });
});

// Pornim serverul pe portul definit
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
