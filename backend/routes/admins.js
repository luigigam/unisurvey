const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const bcrypt = require('bcrypt');
const hashing = require('../middlewares/encrypt_pssw');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middlewares/authenticateToken');
const Event = require('../models/Event');

// Ottieni tutti gli amministratori
router.get('/', async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve admins' });
  }
});

// Ottieni un amministratore specifico
router.get('/:id', getAdmin, async (req, res) => {
  res.json(res.admin);
});

// Creazione di un nuovo amministratore
router.post('/', async (req, res) => {
  const hashed = await hashing(req.body.password);
  const admin = new Admin({
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    password: hashed,
  });

  try {
    const newAdmin = await admin.save();
    res.status(201).json(newAdmin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Aggiornamento di un amministratore esistente
router.patch('/:id', getAdmin, async (req, res) => {
  if (req.body.name != null) {
    res.admin.name = req.body.name;
  }
  if (req.body.surname != null) {
    res.admin.surname = req.body.surname;
  }
  if (req.body.email != null) {
    res.admin.email = req.body.email;
  }
  if (req.body.password != null) {
    const hashed = await hashing(req.body.password);
    res.admin.password = hashed;
  }
  try {
    const updatedAdmin = await res.admin.save();
    res.json(updatedAdmin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Eliminazione di un amministratore
router.delete('/:id', getAdmin, async (req, res) => {
  try {
    await res.admin.deleteOne();
    res.json({ message: 'Deleted Admin' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email });
  if (admin == null) {
    return res.status(400).send('Cannot find admin');
  }
  try {
    if (await bcrypt.compare(req.body.password, admin.password)) {
      const accessToken = jwt.sign(admin.toJSON(), process.env.ACCESS_TOKEN_SECRET);
      res.json({ accessToken: accessToken });
    } else {
      res.send('Not allowed');
    }
  } catch {
    res.status(500).send();
  }
});

// Home
router.post('/home', authenticateToken, (req, res) => {
  res.send('Homepage');
});

// Ottieni tutti gli eventi
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve events' });
  }
});

// Ottieni un evento specifico
router.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve event' });
  }
});
