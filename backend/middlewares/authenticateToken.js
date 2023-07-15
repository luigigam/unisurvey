// authenticateToken.js

const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware per autenticare il token JWT
function authenticateToken(req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Token di autenticazione mancante" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(500).json({ message: "Token di autenticazione non valido" });
  }
}

module.exports = authenticateToken;
