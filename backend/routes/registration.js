const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/user'); // Update with your user model

router.post('/', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username already exists in the database
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash the user's password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create a new user instance with the hashed password
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    // Save the new user to the database
    await newUser.save();

    // Send a success response
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    // Handle any errors that occur during registration
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

module.exports = router;
