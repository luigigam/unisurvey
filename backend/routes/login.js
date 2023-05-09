const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Login = require('../models/login');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // Cerca l'utente nel database per l'email fornita
  const login = await Login.findOne({ email });
  if (!login) {
    return res.status(401).json({ message: 'Credenziali non valide' });
  }
  // Verifica la password fornita con la password crittografata nel database
  const isValidPassword = await login.isValidPassword(password);
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Credenziali non valide' });
  }
  // Genera il token di autenticazione dell'utente
  const token = jwt.sign({ id: login._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return res.status(200).json({ token });
});

module.exports = router;
