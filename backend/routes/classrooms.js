const express = require('express');
const router = express.Router();
const Classroom = require('../models/classroom');

/**
 * @swagger
 * components:
 *   schemas:
 *     Classroom:
 *       type: object
 *       properties:
 *         numero:
 *           type: string
 *           description: Numero dell'aula
 *         descrizione:
 *           type: string
 *           description: Descrizione dell'aula
 *         posti:
 *           type: integer
 *           description: Numero di posti disponibili nell'aula
 *       required:
 *         - numero
 *         - descrizione
 *         - posti
 */

/**
 * @swagger
 * /classrooms:
 *   get:
 *     summary: Ottieni tutte le aule
 *     tags:
 *       - Classrooms
 *     responses:
 *       200:
 *         description: Elenco delle aule
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Classroom'
 *       500:
 *         description: Errore interno del server
 */
router.get('/', (req, res) => {
  Classroom.find({}, (err, aule) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(aule);
    }
  });
});

module.exports = router;
