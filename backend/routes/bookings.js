const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Crea una nuova prenotazione
 *     tags:
 *       - Bookings
 *     requestBody:
 *       description: Dati della prenotazione
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               aula:
 *                 type: string
 *                 description: ID dell'aula prenotata
 *               data:
 *                 type: string
 *                 format: date
 *                 description: Data della prenotazione
 *               fasciaOraria:
 *                 type: string
 *                 description: Fascia oraria della prenotazione
 *               numberOfSeats:
 *                 type: integer
 *                 description: Numero di posti richiesti
 *               location:
 *                 type: string
 *                 description: Posizione dell'aula
 *             required:
 *               - aula
 *               - data
 *               - fasciaOraria
 *               - numberOfSeats
 *               - location
 *     responses:
 *       201:
 *         description: Prenotazione creata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 aula:
 *                   type: string
 *                   description: ID dell'aula prenotata
 *                 data:
 *                   type: string
 *                   format: date
 *                   description: Data della prenotazione
 *                 fasciaOraria:
 *                   type: string
 *                   description: Fascia oraria della prenotazione
 *                 numberOfSeats:
 *                   type: integer
 *                   description: Numero di posti richiesti
 *                 location:
 *                   type: string
 *                   description: Posizione dell'aula
 *       500:
 *         description: Errore interno del server
 */

router.post('/', (req, res) => {
  const { aula, data, fasciaOraria, numberOfSeats, location } = req.body;

  const booking = new Booking({
    aula,
    data,
    fasciaOraria,
    numberOfSeats,
    location
  });

  booking.save((err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(201).json(booking);
    }
  });
});

module.exports = router;
