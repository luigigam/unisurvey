//Implementa User
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const accessSchema = new mongoose.Schema({
  role: { type: String, enum: ['Student', 'Administration'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  access: { type: [accessSchema], required: true }
});

userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();
  const hashedPassword = await bcrypt.hash(user.password, 10);
  user.password = hashedPassword;
  next();
});

userSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.hasAccess = function (role, date) {
  const access = this.access.find(a => a.role === role && a.startDate <= date && (!a.endDate || a.endDate >= date));
  return !!access;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

