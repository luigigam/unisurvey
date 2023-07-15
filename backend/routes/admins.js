require("dotenv").config();

const express = require('express');
const router = express.Router();
const Admin = require("../models/admin");
const Student = require("../models/student");
const Event = require("../models/event");
const bcrypt = require("bcrypt");
const hashing = require("../middlewares/encrypt_pssw");
const jwt = require("jsonwebtoken");
const getStudent = require("../middlewares/getStudent");
const getEvent = require("../middlewares/getEvent");
const authenticateToken = require("../middlewares/authenticateToken");
const validateEmail = require("../middlewares/validateEmail");
const { google } = require("googleapis");
var calendar_constants = require("../middlewares/calendar_constants.js");
const Classroom = require("../models/classroom");
const Survey = require("../models/survey");


// ************ ADMIN FUNCTIONS ************

/**
 * @swagger
 * /admins/token:
 *  post:
 *      tags: [admin]
 *      summary: genera un nuovo token di accesso
 *      description: utilizza il token di aggiornamento fornito per generare un nuovo token di accesso
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          token:
 *                              type: string
 *      responses:
 *          '401':
 *              description: 'Unauthorized'
 *          '403':
 *              description: 'Forbidden'
 *          '200':
 *              description: 'nuovo token di accesso'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 */
router.post('/token', (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.status(401);
  if (!refreshTokens.includes(refreshToken)) return res.status(403);
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, admin) => {
      if (err) return res.status(403);
      admin = await Admin.findOne({ email: admin.email });
      const accessToken = generateAccessToken(admin.toJSON());
      res.json({ accessToken: accessToken });
    }
  );
});

/**
 * @swagger
 * /admins/logout:
 *  delete:
 *      tags: [admin]
 *      summary: effettua il logout di un amministratore
 *      description: rimuove il token di aggiornamento JWT di un amministratore dalla lista dei token di aggiornamento, impedendo la creazione di nuovi token di accesso JWT.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *      responses:
 *          '204':
 *              description: 'nessun contenuto, logout'
 */
router.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

/**
 * @swagger
 * /admins/updateAdmin/{id}:
 *  patch:
 *      tags: [admin]
 *      summary: aggiorna un amministratore esistente
 *      description: l'amministratore modifica alcune delle sue informazioni come nome, cognome, email e password.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          name:
 *                              type: string
 *                          surname:
 *                              type: string
 *                          email:
 *                              type: string
 *                          password:
 *                              type: string
 *      responses:
 *          '400':
 *              description: 'Richiesta non valida'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '404':
 *              description: 'amministratore non trovato'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '500':
 *              description: 'errore interno del database'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *          '202':
 *              description: 'informazioni amministratore aggiornate con successo'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 */

async function getAdmin(req, res, next) {
  let admin;
  try {
    admin = await Admin.findById(req.params.id);
    if (admin == null) {
      return res.status(404).json({ message: "Cannot find admin" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.admin = admin;
  next();
}

router.patch(
  '/updateAdmin/:id',
  authenticateToken,
  getAdmin,
  async (req, res) => {
    if (req.body.name != null) {
      res.admin.name = req.body.name;
    }
    if (req.body.surname != null) {
      res.admin.surname = req.body.surname;
    }
    if (req.body.email != null) {
      if (!validateEmail(req.body.email)) {
        return res.status(400).json({ state: 'invalid-email' });
      }
      res.admin.email = req.body.email;
    }
    if (req.body.password != null) {
      const hashed = await hashing(req.body.password);
      res.admin.password = hashed;
    }
    try {
      const updatedAdmin = await res.admin.save();
      res.status(202).json(updatedAdmin);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * @swagger
 * /admins/deleteadmin/{id}:
 *  delete:
 *      tags: [admin]
 *      summary: rimuovi un amministratore di destinazione
 *      description: rimuove l'amministratore identificato dall'id fornito dal servizio web
 *      responses:
 *          '404':
 *              description: 'amministratore non trovato'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '500':
 *              description: 'errore interno del database'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '200':
 *              description: 'amministratore rimosso con successo dalla lista degli amministratori'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 */
router.delete(
  '/deleteadmin/:id',
  authenticateToken,
  getAdmin,
  async (req, res) => {
    try {
      await res.admin.deleteOne();
      res.status(200).json({ message: 'Deleted Admin' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ************ STUDENTS FUNCTIONS ************

/**
 * @swagger
 * /admins/studentManager/getstudents:
 *  get:
 *      tags: [admin]
 *      summary: cerca tutti gli studenti
 *      description: restituisce un elenco di tutti gli studenti registrati
 *      responses:
 *          '500':
 *              description: 'errore interno del database'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '200':
 *              description: 'Successo: restituisce l'elenco degli studenti'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              searchingList:
 *                                  type: list
 */
router.get(
  '/studentManager/getstudents',
  authenticateToken,
  async (req, res) => {
    try {
      const students = await Student.find();
      res.status(200).json(students);
    } catch {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * @swagger
 * /admins/studentManager/getstudent/{id}:
 *  get:
 *      tags: [admin]
 *      summary: cerca uno studente per id
 *      description: viene fornito uno studente e viene restituito lo studente corrispondente a quell'id particolare
 *      responses:
 *          '404':
 *              description: 'studente non trovato'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '500':
 *              description: 'errore interno del database'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '200':
 *              description: 'Successo: restituisce lo studente specificato per id'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              searchingList:
 *                                  type: list
 */
router.get(
  '/studentManager/getstudent/:id',
  authenticateToken,
  getStudent,
  async (req, res) => {
    res.status(200).json(res.student);
  }
);

/**
 * @swagger
 * /admins/studentManager/updatestudent/{id}:
 *  patch:
 *      tags: [admin]
 *      summary: aggiorna uno studente di destinazione esistente
 *      description: l'amministratore autenticato modifica alcune delle informazioni dello studente relative all'università come email, matricola studente, corso di studio e anno di studio.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          email:
 *                              type: string
 *                          student_id:
 *                              type: string
 *                          study_course:
 *                              type: string
 *                          study_year:
 *                              type: string
 *      responses:
 *          '400':
 *              description: 'Richiesta non valida'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '404':
 *              description: 'studente non trovato'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '500':
 *              description: 'errore interno del database'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *          '202':
 *              description: 'informazioni studente aggiornate con successo'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 */
router.patch(
  '/studentManager/updatestudent/:id',
  authenticateToken,
  getStudent,
  async (req, res) => {
    if (req.body.email != null) {
      if (!validateEmail(req.body.email)) {
        return res.status(400).json({ state: 'invalid-email' });
      }
      res.student.email = req.body.email;
    }
    if (req.body.student_id != null) {
      res.student.student_id = req.body.student_id;
    }
    if (req.body.study_course != null) {
      res.student.study_course = req.body.study_course;
    }
    if (req.body.study_year != null) {
      res.student.study_year = req.body.study_year;
    }
    try {
      const updatedStudent = await res.student.save();
      res.status(202).json(updatedStudent);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * @swagger
 * /admins/studentManager/deletestudent/{id}:
 *  delete:
 *      tags: [admin]
 *      summary: rimuovi uno studente di destinazione
 *      description: lo studente identificato dall'id fornito viene rimosso dal servizio web
 *      responses:
 *          '404':
 *              description: 'studente non trovato'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '500':
 *              description: 'errore interno del database'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '200':
 *              description: 'studente rimosso con successo dall'elenco degli studenti'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 */
router.delete(
  '/studentManager/deletestudent/:id',
  authenticateToken,
  getStudent,
  async (req, res) => {
    try {
      await res.student.deleteOne();
      res.json({ message: 'Deleted Student' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ************ EVENTS FUNCTIONS ************

/**
 * @swagger
 * /admins/eventManager/createEvent:
 *  post:
 *      tags: [admin]
 *      summary: crea un nuovo evento
 *      description: l'amministratore crea un evento nel calendario di Google, le informazioni sono archiviate anche in MongoDB.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          summary:
 *                              type: string
 *                          start:
 *                              type: string
 *                          end:
 *                              type: string
 *                          description:
 *                              type: string
 *                          location:
 *                              type: string
 *                          colorID:
 *                              type: string
 *      responses:
 *          '500':
 *              description: 'errore interno del database'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *          '201':
 *              description: 'evento creato con successo'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 */
router.post('/eventManager/createEvent', authenticateToken, async (req, res) => {
  var event = {
    summary: `${req.body.summary}`,
    location: `${req.body.location}`,
    description: `${req.body.description}`,
    start: {
      dateTime: `${req.body.start}`,
    },
    end: {
      dateTime: `${req.body.end}`,
    },
    attendees: [],
    colorId: `${req.body.colorID}`,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 10 },
      ],
    },
  };

  const mongo_event = new Event({
    summary: req.body.summary,
    start: req.body.start,
    end: req.body.end,
    description: req.body.description,
    location: req.body.location,
    colorID: req.body.colorID,
  });

  const auth = new google.auth.GoogleAuth({
    keyFile: './google-calendar-key-path.json',
    scopes: 'https://www.googleapis.com/auth/calendar',
  });
  auth.getClient().then((a) => {
    calendar_constants.calendar.events.insert(
      {
        auth: a,
        calendarId: calendar_constants.GOOGLE_CALENDAR_ID,
        resource: event,
      },
      async function (err, event) {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err);
          res.status(500).json({ message: err.message });
          return;
        }
        const newEvent = await mongo_event.save();
        console.log('Event created: %s', event.data);
        res.status(201).json(newEvent);
      }
    );
  });
});

/**
 * @swagger
 * /admins/eventManager/updateevent/{id}:
 *  patch:
 *      tags: [admin]
 *      summary: aggiorna un evento esistente
 *      description: l'amministratore modifica alcune delle informazioni dell'evento come il titolo, la data di inizio, la data di fine, la descrizione e la posizione. NB queste modifiche sono visibili solo nel database, le modifiche nel calendario di Google vengono effettuate direttamente lì.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          summary:
 *                              type: string
 *                          start:
 *                              type: string
 *                          description:
 *                              type: string
 *                          location:
 *                              type: string
 *      responses:
 *          '400':
 *              description: 'Richiesta non valida'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '404':
 *              description: 'studente non trovato'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '500':
 *              description: 'errore interno del database'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *          '202':
 *              description: 'informazioni evento aggiornate con successo'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 */
router.patch(
  '/eventManager/updateevent/:id',
  authenticateToken,
  getEvent,
  async (req, res) => {
    if (req.body.summary != null) {
      res.event.summary = req.body.summary;
    }
    if (req.body.start != null) {
      res.event.start = req.body.start;
    }
    if (req.body.end != null) {
      res.event.end = req.body.end;
    }
    if (req.body.description != null) {
      res.event.description = req.body.description;
    }
    if (req.body.location != null) {
      res.event.location = req.body.location;
    }
    try {
      const updatedEvent = await res.event.save();
      res.status(202).json(updatedEvent);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

/**
 * @swagger
 * /admins/eventManager/deleteevent/{id}:
 *  delete:
 *      tags: [admin]
 *      summary: rimuovi un evento di destinazione
 *      description: l'evento identificato dall'id fornito viene rimosso dalla lista degli eventi in MongoDB
 *      responses:
 *          '404':
 *              description: 'evento non trovato'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '500':
 *              description: 'errore interno del database'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '200':
 *              description: 'evento rimosso con successo dalla lista degli eventi'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 */
router.delete(
  '/eventManager/deleteevent/:id',
  authenticateToken,
  getEvent,
  async (req, res) => {
    try {
      await res.event.deleteOne();
      res.status(200).json({ message: 'Deleted Event' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// CLASSROOMS

/**
 * @swagger
 * /admins/classroomManager/createClassroom:
 *  post:
 *      tags: [admin]
 *      summary: crea una nuova aula
 *      description: l'amministratore crea una nuova aula con il controllo della validazione del codice in input.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          code:
 *                              type: string
 *                          seats:
 *                              type: integer
 *                          available:
 *                              type: boolean
 *      responses:
 *          '409':
 *              description: 'Codice aula già in uso'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '400':
 *              description: 'Richiesta non valida'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '500':
 *              description: 'errore interno del database'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *          '201':
 *              description: 'aula creata con successo'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 */
router.post(
  '/classroomManager/createClassroom',
  authenticateToken,
  async (req, res) => {
    const duplicateClass = await Classroom.findOne({ code: req.body.code });
    if (duplicateClass != null) {
      return res.status(409).json({ message: 'Classroom code already exists' });
    }
    const classroom = new Classroom({
      code: req.body.code,
      seats: req.body.seats,
      available: true,
    });
    try {
      const newClassroom = await classroom.save();
      res.status(201).json(newClassroom);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * @swagger
 * /admins/classroomManager/resetBooking:
 *  patch:
 *      tags: [admin]
 *      summary: reimposta tutte le prenotazioni delle aule
 *      description: l'amministratore imposta tutte le aule come disponibili. È consigliabile chiamare questa funzione alla fine della giornata.
 *      responses:
 *          '500':
 *              description: 'errore interno del database'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *          '202':
 *              description: 'disponibilità aula aggiornata con successo a true'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 */
router.patch(
  '/classroomManager/resetBooking',
  authenticateToken,
  async (req, res) => {
    try {
      await Classroom.updateMany(
        { available: false },
        { $set: { available: true } }
      );
      res.status(202).json({ message: 'All classrooms are now available' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ************ SURVEYS FUNCTIONS ************

/**
 * @swagger
 * /admins/surveyManager/createSurvey:
 *   post:
 *     summary: Aggiungi un nuovo sondaggio nel database
 *     tags: [admin]
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
router.post(
  '/surveyManager/createSurvey',
  authenticateToken,
  async (req, res) => {
    const duplicateSurvey = await Survey.findOne({ link: req.body.link });
    if (duplicateSurvey != null) {
      return res.status(409).json({ message: 'Survey already exists' });
    }
    const survey = new Survey({
      title: req.body.title,
      link: req.body.link,
    });
    try {
      const newSurvey = await survey.save();
      res.status(201).json(newSurvey);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * @swagger
 * /admins/surveyManager/deleteSurvey/{id}:
 *   delete:
 *     summary: Rimuovi un sondaggio esistente dal database
 *     tags: [admin]
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
router.delete(
  '/surveyManager/deleteSurvey/:id',
  authenticateToken,
  async (req, res) => {
    try {
      await res.survey.deleteOne();
      res.status(200).json({ message: 'Deleted Survey' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
