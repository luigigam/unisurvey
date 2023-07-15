const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Rotta di login
router.post('/', (req, res) => {
  const { username, password } = req.body;

  // Effettua la logica di autenticazione e verifica delle credenziali

 // Esempio di verifica delle credenziali con bcrypt
 if (username === 'admin' && bcrypt.compareSync(password, hashedAdminPassword)) {
    const user = { username: 'admin', role: 'admin' };
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.json({ accessToken, refreshToken });
  } else if (username === 'user' && bcrypt.compareSync(password, hashedUserPassword)) {
    const user = { username: 'user', role: 'user' };
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.json({ accessToken, refreshToken });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Funzione per generare l'access token
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
}

// Funzione per generare il refresh token
function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
}

module.exports = router;
