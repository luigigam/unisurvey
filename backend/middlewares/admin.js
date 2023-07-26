// admin.js

const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware per verificare se l'utente è un amministratore
function admin(req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Token di autenticazione mancante" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Accesso negato. Solo gli amministratori possono accedere a questa risorsa" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Errore nella verifica del token di autenticazione" });
  }
}

module.exports = admin;
