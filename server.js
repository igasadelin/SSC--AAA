// Importăm modulele necesare
const express = require("express"); // Framework pentru crearea serverului
const jwt = require("jsonwebtoken"); // Gestionarea token-urilor JWT
const fs = require("fs"); // Modul pentru manipularea fișierelor

const app = express(); // Inițializăm aplicația Express
const PORT = 3000; // Definim portul pe care rulează serverul

app.use(express.json()); // Middleware pentru parsarea request-urilor JSON

// Cheia secretă folosită pentru semnarea token-urilor JWT
const SECRET_KEY = "secret123"; 

// Lista de utilizatori simulați (într-o aplicație reală, ar fi stocați într-o bază de date)
const users = [
  { id: 1, username: "admin", password: "admin123", role: "admin" }, // Utilizator cu rol de admin
  { id: 2, username: "user", password: "user123", role: "user" }, // Utilizator cu rol de user
];

// Funcție pentru înregistrarea acțiunilor în fișierul de audit
function auditLog(message) {
  const logMessage = `${new Date().toISOString()} - ${message}\n`; // Creăm un mesaj cu timestamp
  fs.appendFileSync("audit.log", logMessage); // Salvăm mesajul în fișierul `audit.log`
}

// Endpoint pentru autentificare (Login)
app.post("/login", (req, res) => {
  const { username, password } = req.body; // Extragem username și password din request

  // Căutăm utilizatorul în lista definită mai sus
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    auditLog(`Failed login attempt for username: ${username}`); // Logăm încercarea eșuată
    return res.status(401).json({ message: "Invalid credentials" }); // Returnăm eroare 401 (Unauthorized)
  }

  // Generăm un token JWT care conține ID-ul și rolul utilizatorului
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
    expiresIn: "1h", // Token-ul expiră în 1 oră
  });

  auditLog(`User ${username} logged in`); // Logăm autentificarea reușită
  res.json({ token }); // Returnăm token-ul generat
});

// Middleware pentru autorizare pe baza rolurilor
function authorize(roles) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization; // Preluăm header-ul Authorization

    if (!authHeader) 
      return res.status(403).json({ message: "No token provided" }); // Dacă nu există token, returnăm eroare 403 (Forbidden)

    const token = authHeader.split(" ")[1]; // Extragem token-ul din header

    // Verificăm token-ul JWT
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid token" }); // Dacă token-ul e invalid, returnăm 403

      if (!roles.includes(decoded.role)) 
        return res.status(403).json({ message: "Forbidden" }); // Dacă rolul utilizatorului nu este permis, returnăm 403

      req.user = decoded; // Adăugăm utilizatorul decodificat în request pentru a fi folosit mai departe
      next(); // Continuăm execuția request-ului
    });
  };
}

// Endpoint principal pentru verificare (serverul este activ)
app.get("/", (req, res) => {
  res.send("Serverul este activ!");
});

// Endpoint protejat - Acces doar pentru administratori
app.get("/admin", authorize(["admin"]), (req, res) => {
  auditLog(`Admin access by user ID: ${req.user.id}`); // Logăm accesul
  res.json({ message: "Welcome, Admin!" }); // Returnăm mesaj de succes
});

// Endpoint protejat - Acces pentru admin și user
app.get("/user", authorize(["admin", "user"]), (req, res) => {
  auditLog(`User access by user ID: ${req.user.id}`); // Logăm accesul
  res.json({ message: "Welcome, User!" }); // Returnăm mesaj de succes
});

// Pornim serverul pe portul definit
app.listen(PORT, () => 
  console.log(`Server running on http://localhost:${PORT}`)
);


// Rularea serverului: node server.js
// Accesarea serverului: http://localhost:3000

//Explicatie generala:
//Acest server implementează principiile AAA (Autentificare, Autorizare și Audit):

//Autentificare (Authentication)
//POST /login → Verifică username și password, generează un token JWT dacă sunt corecte.

//Autorizare (Authorization)
//Middleware-ul authorize(roles) verifică dacă utilizatorul are permisiunea de a accesa un endpoint.

//Audit
//Fiecare acțiune importantă (autentificare, acces la rute protejate, încercări eșuate) este logată în audit.log.

//cat audit.log - pentru afisarea logurilor