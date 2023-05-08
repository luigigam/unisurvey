const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const loginSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

// Funzione per crittografare la password prima di salvarla nel database
loginSchema.pre('save', async function(next) {
  const login = this;
  if (!login.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  login.password = await bcrypt.hash(login.password, salt);
  next();
});

// Funzione per verificare la password durante il login
loginSchema.methods.isValidPassword = async function(password) {
  const login = this;
  return await bcrypt.compare(password, login.password);
};

module.exports = mongoose.model('Login', loginSchema);
