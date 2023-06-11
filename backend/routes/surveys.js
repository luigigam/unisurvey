const express = require('express');
const router = express.Router();
const Survey = require('../models/survey');

/**
 * @swagger
 * tags:
 *   name: survey
 *   description: API per la gestione dei sondaggi
 */

/**
 * @swagger
 * /survey:
 *   post:
 *     summary: Aggiungi un nuovo sondaggio
 *     tags: [survey]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               link:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Sondaggio salvato nel database
 *       '500':
 *         description: Errore durante il salvataggio del sondaggio
 */
router.post('/', (req, res) => {
  const { title, link } = req.body;
  const newSurvey = new Survey({
    title,
    link
  });
  newSurvey.save()
    .then(() => res.status(200).json({ message: 'Sondaggio salvato nel database' }))
    .catch(error => res.status(500).json({ error: 'Errore durante il salvataggio del sondaggio' }));
});

/**
 * @swagger
 * /survey/{id}:
 *   delete:
 *     summary: Rimuovi un sondaggio esistente
 *     tags: [survey]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del sondaggio da rimuovere
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Sondaggio rimosso dal database
 *       '500':
 *         description: Errore durante la rimozione del sondaggio
 */
router.delete('/:id', (req, res) => {
  const surveyId = req.params.id;
  Survey.findByIdAndRemove(surveyId)
    .then(() => res.status(200).json({ message: 'Sondaggio rimosso dal database' }))
    .catch(error => res.status(500).json({ error: 'Errore durante la rimozione del sondaggio' }));
});

module.exports = router;
