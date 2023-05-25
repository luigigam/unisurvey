require("dotenv").config();

const express = require("express");
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
const Survey = require('../models/survey');
const Question = require('../models/question');

/**
 * @swagger
 * /admins:
 *  get:
 *      tags: [admin]
 *      summary: search all admins
 *      description: a list of all admins registered is returned.
 *      responses:
 *          '500':
 *              description: 'database internal error'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '200':
 *              description: 'Success: return the list of admins'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              searchingList:
 *                                  type: list
 *
 */
router.get("/getall", async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /admins/{id}:
 *  get:
 *      tags: [admin]
 *      summary: search admin by id
 *      description: an admin is submitted and the admin matching that particular id is returned.
 *      responses:
 *          '404':
 *              description: 'admin not found'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '500':
 *              description: 'database internal error'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '200':
 *              description: 'Success: return specified admin by id'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              searchingList:
 *                                  type: list
 *
 */
router.get("/getadmin/:id", getAdmin, async (req, res) => {
  res.json(res.admin);
});

/**
 * @swagger
 * /admins/signup:
 *  post:
 *      tags: [admin]
 *      summary: register a new admin
 *      description: the admin is created after some validation checks.
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
 *          '409':
 *              description: 'email already in use: duplicate admin'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '400':
 *              description: 'bad request'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '500':
 *              description: 'database internal error'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *          '201':
 *              description: 'admin successfully created'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *
 */
router.post("/signup", async (req, res) => {
  const duplicateUser = await Admin.findOne({ email: req.body.email });
  if (duplicateUser != null) {
    return res.status(409).json({ message: "email-already-in-use" });
  }
  if (!validateEmail(req.body.email)) {
    return res.status(400).json({ state: "invalid-email" });
  }
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
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /admins/login:
 *  post:
 *      tags: [admin]
 *      summary: log into an existing admin
 *      description: the admin is logged in after validation of his email and password. A JWT token is returned.
 *      responses:
 *          '400':
 *              description: 'Bad request'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '404':
 *              description: 'email not found'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '401':
 *              description: 'wrong password: failed authentication'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *
 *          '500':
 *              description: 'database internal error'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *          '200':
 *              description: 'user logged in'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *
 */
router.post("/login", async (req, res) => {
  if (!validateEmail(req.body.email)) {
    return res.status(400).send("Invalid email");
  }
  const admin = await Admin.findOne({ email: req.body.email });
  if (admin == null) {
    return res.status(404).send("Cannot find admin");
  }
  try {
    if (await bcrypt.compare(req.body.password, admin.password)) {
      const accessToken = jwt.sign(
        admin.toJSON(),
        process.env.ACCESS_TOKEN_SECRET
      );
      res.status(200).json({ accessToken: accessToken });
    } else {
      res.status(401).send("Not allowed");
    }
  } catch {
    res.status(500).send();
  }
});

/**
 * @swagger
 * /admins/{id}:
 *  patch:
 *      tags: [admin]
 *      summary: update an existing admin
 *      description: the admin changes some of his datas like name, surname, email and password.
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
 *              description: 'Bad request'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '404':
 *              description: 'student not found'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '500':
 *              description: 'database internal error'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *          '202':
 *              description: 'admin information updated succesfully'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *
 */
router.patch("/updateAdmin/:id", getAdmin, async (req, res) => {
  if (req.body.name != null) {
    res.admin.name = req.body.name;
  }
  if (req.body.surname != null) {
    res.admin.surname = req.body.surname;
  }
  if (req.body.email != null) {
    if (!validateEmail(req.body.email)) {
      return res.status(400).json({ state: "invalid-email" });
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
});

/**
 * @swagger
 * /admins/{id}:
 *  delete:
 *      tags: [admin]
 *      summary: remove target admin
 *      description: the admin identified by the provided id is removed from the web service
 *      responses:
 *          '404':
 *              description: 'admin not found'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '500':
 *              description: 'database internal error'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '200':
 *              description: 'admin successfully removed from admin list'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *
 */
router.delete("/deleteadmin/:id", getAdmin, async (req, res) => {
  try {
    await res.admin.deleteOne();
    res.status(200).json({ message: "Deleted Admin" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Home
router.post("/home", authenticateToken, (req, res) => {
  res.send("Homepage");
});

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

// ************ STUDENTS FUNCTIONS ************

/**
 * @swagger
 * /admins/studentManager/getstudents:
 *  get:
 *      tags: [admin]
 *      summary: search all students
 *      description: a list of all students registered is returned.
 *      responses:
 *          '500':
 *              description: 'database internal error'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '200':
 *              description: 'Success: return the list of students'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              searchingList:
 *                                  type: list
 *
 */
router.get("/studentManager/getstudents", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /admins/studentManager/getstudent/{id}:
 *  get:
 *      tags: [admin]
 *      summary: search a student by id
 *      description: a student is submitted and the student matching that particular id is returned.
 *      responses:
 *          '404':
 *              description: 'student not found'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '500':
 *              description: 'database internal error'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '200':
 *              description: 'Success: return specified student by id'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              searchingList:
 *                                  type: list
 *
 */
router.get("/studentManager/getstudent/:id", getStudent, async (req, res) => {
  res.status(200).json(res.student);
});

/**
 * @swagger
 * /admins/studentManager/updatestudent/{id}:
 *  patch:
 *      tags: [admin]
 *      summary: update an existing target student
 *      description: the admin changes some of target student university-related datas like email, student id, study course and study year.
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
 *              description: 'Bad request'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '404':
 *              description: 'student not found'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *
 *          '500':
 *              description: 'database internal error'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *          '202':
 *              description: 'student information updated succesfully'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *
 */
router.patch("/studentManager/updatestudent/:id", getStudent, async (req, res) => {
  if (req.body.email != null) {
    if (!validateEmail(req.body.email)) {
      return res.status(400).json({ state: "invalid-email" });
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
});

/**
 * @swagger
 * /admins/studentManager/deletestudent/{id}:
 *  delete:
 *      tags: [admin]
 *      summary: remove target student
 *      description: the student identified by the provided id is removed from the web service
 *      responses:
 *          '404':
 *              description: 'student not found'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '500':
 *              description: 'database internal error'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '200':
 *              description: 'student successfully removed from student list'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *
 */
router.delete("/studentManager/deletestudent/:id", getStudent, async (req, res) => {
  try {
    await res.student.deleteOne();
    res.json({ message: "Deleted Student" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ************ EVENTS FUNCTIONS ************

/**
 * @swagger
 * /admins/eventManager/createEvent:
 *  post:
 *      tags: [admin]
 *      summary: create a new event
 *      description: the admin creates an event.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          name:
 *                              type: string
 *                          startDate:
 *                              type: Date
 *                          endDate:
 *                              type: Date
 *                          description:
 *                              type: string
 *                          location:
 *                              type: string
 *                          isRegular:
 *                              type: Boolean
 *      responses:
 *          '400':
 *              description: 'bad request'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '500':
 *              description: 'database internal error'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *          '201':
 *              description: 'event successfully created'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *
 */
router.post("/eventManager/createEvent", async (req, res) => {

  const event = new Event({
    name: req.body.name,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    description: req.body.description,
    location: req.body.location,
    isRegular: req.body.isRegular,
  });

  try {
    if (req.body.startDate <= req.body.endDate) {
      const newEvent = await event.save();
      res.status(201).json(newEvent);
    } else {
      res.status(400).json({ state: "Start Date cannot be later than End Date" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /admins/eventManager/updateevent/{id}:
 *  patch:
 *      tags: [admin]
 *      summary: update an existing event
 *      description: the admin changes some of the event informations like name, start date, end date, description, location and the cadentcy.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          name:
 *                              type: string
 *                          startDate:
 *                              type: Date
 *                          description:
 *                              type: Date
 *                          location:
 *                              type: string
 *                          isRegular:
 *                              type: boolean
 *      responses:
 *          '400':
 *              description: 'Bad request'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '404':
 *              description: 'student not found'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '500':
 *              description: 'database internal error'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *          '202':
 *              description: 'event information updated succesfully'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *
 */
router.patch("/eventManager/updateevent/:id", getEvent, async (req, res) => {
  if (req.body.name != null) {
    res.event.name = req.body.name;
  }
  if (req.body.startDate != null) {
    res.event.startDate = req.body.startDate;
  }
  if (req.body.endDate != null) {
    res.event.endDate = req.body.endDate;
  }
  if (req.body.description != null) {
    res.event.description = req.body.description;
  }
  if (req.body.location != null) {
    res.event.location = req.body.location;
  }
  if (req.body.isRegular != null) {
    res.event.isRegular = req.body.isRegular;
  }
  try {
    // to fix
    if (res.body.startDate <= res.body.endDate)  {
      const updatedEvent = await res.event.save();
      res.status(202).json(updatedEvent);
    } else {
      res.status(400).json({ state: "Start Date cannot be later than End Date" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /admins/eventManager/deleteevent/{id}:
 *  delete:
 *      tags: [admin]
 *      summary: remove target event
 *      description: the event identified by the provided id is removed from the event list
 *      responses:
 *          '404':
 *              description: 'event not found'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '500':
 *              description: 'database internal error'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '200':
 *              description: 'event successfully removed from event list'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *
 */
router.delete("/eventManager/deleteevent/:id", getEvent, async (req, res) => {
	try {
		await res.event.deleteOne()
		res.json({ message: "Deleted Event" })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

/**
 * @swagger
 * /admin/surveys:
 *   post:
 *     tags: [admin]
 *     summary: Create a new survey
 *     description: Creates a new survey with the provided information.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               questions:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/QuestionInput'
 *     responses:
 *       '201':
 *         description: 'Survey successfully created'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Survey'
 *       '500':
 *         description: 'Database error'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/surveys', authenticateToken, async (req, res) => {
  const survey = new Survey({
    title: req.body.title,
    description: req.body.description,
  });

  try {
    // Aggiungi le domande al sondaggio
    survey.questions = await Question.insertMany(req.body.questions);

    // Salva il nuovo sondaggio nel database
    const newSurvey = await survey.save();
    res.status(201).json(newSurvey);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /admin/surveys/{id}:
 *   patch:
 *     tags: [admin]
 *     summary: Update an existing survey
 *     description: Updates the details of an existing survey.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the survey to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SurveyInput'
 *     responses:
 *       '200':
 *         description: 'Survey successfully updated'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Survey'
 *       '404':
 *         description: 'Survey not found'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: 'Database error'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.patch('/surveys/:id', authenticateToken, getSurvey, async (req, res) => {
  if (req.body.title != null) {
    res.survey.title = req.body.title;
  }
  if (req.body.description != null) {
    res.survey.description = req.body.description;
  }
  try {
    const updatedSurvey = await res.survey.save();
    res.status(200).json(updatedSurvey);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /admin/surveys/{id}:
 *   delete:
 *     tags: [admin]
 *     summary: Delete a survey
 *     description: Deletes a survey and its associated questions.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the survey to delete
 *     responses:
 *       '204':
 *         description: 'Survey successfully deleted'
 *       '404':
 *         description: 'Survey not found'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: 'Database error'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete('/surveys/:id', authenticateToken, getSurvey, async (req, res) => {
  try {
    // Elimina tutte le domande associate al sondaggio
    await Question.deleteMany({ survey: req.params.id });

    // Elimina il sondaggio
    await res.survey.remove();
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Survey:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Question'
 *     SurveyInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *     Question:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         survey:
 *           type: string
 *         type:
 *           type: string
 *         question:
 *           type: string
 *         options:
 *           type: array
 *           items:
 *             type: string
 *     QuestionInput:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *         question:
 *           type: string
 *         options:
 *           type: array
 *           items:
 *             type: string
 */

module.exports = router;
