const express = require('express');
const router = express.Router();

const User = require('../models/user');

const isAdmin = (req, res, next) => {
  if (req.user.role === 'Administration') {
    return next();
  }
  return res.status(403).json({ message: 'You are not authorized to access this resource' });
};

router.put('/:id/promote', isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.role = 'Administration';
    await user.save();
    res.json({ message: 'User promoted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
