const express = require('express');
const router = express.Router();
const Classroom = require('../models/classroom');
const Reservation = require('../models/reservation');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/**
 * @swagger
 * /classrooms:
 *   post:
 *     summary: Crea una nuova classe
 *     tags: [Classrooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Il nome della classe
 *               capacity:
 *                 type: number
 *                 description: La capacità della classe
 *     responses:
 *       '200':
 *         description: Classe creata con successo
 *       '400':
 *         description: Richiesta non valida
 *       '500':
 *         description: Errore del server
 */

router.get("/getclassrooms", async (req, res) => {
  try {
    const classrooms = await Classroom.find();
    res.status(200).json(classrooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, capacity } = req.body;

    // Crea una nuova classe
    const classroom = new Classroom({
      name,
      capacity
    });

    // Salva la classe nel database
    await classroom.save();

    res.status(200).json({ message: 'Classe creata con successo' });
  } catch (error) {
    console.log('Errore:', error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

/**
 * @swagger
 * /classrooms/{id}/reservations:
 *   post:
 *     summary: Effettua una prenotazione per una classe specifica
 *     tags: [Classrooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: L'ID della classe da prenotare
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reservation'
 *     responses:
 *       '200':
 *         description: Prenotazione effettuata con successo
 *       '400':
 *         description: Richiesta non valida
 *       '500':
 *         description: Errore del server
 */

router.post('/:id/reservations', async (req, res) => {
  try {
    const classroomId = req.params.id;
    const { user, date, startTime, endTime } = req.body;

    // Verifica se la classe esiste
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(400).json({ message: 'La classe specificata non esiste' });
    }

    // Crea la nuova prenotazione
    const reservation = new Reservation({
      classroom: classroom._id,
      user,
      date,
      startTime,
      endTime
    });

    // Salva la prenotazione nel database
    await reservation.save();

    res.status(200).json({ message: 'Prenotazione effettuata con successo' });
  } catch (error) {
    console.log('Errore:', error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

module.exports = router;
