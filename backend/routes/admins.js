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
const { google } = require("googleapis");
var calendar_constants = require("../middlewares/calendar_constants.js");
const Classroom = require("../models/classroom");
const Survey = require("../models/survey");

/**
 * @swagger
 * /admins/getall:
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
router.get("/getall", authenticateToken, async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /admins/getadmin/{id}:
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
router.get("/getadmin/:id", authenticateToken, getAdmin, async (req, res) => {
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

let refreshTokens = [];

/**
 * @swagger
 * /admins/login:
 *  post:
 *      tags: [admin]
 *      summary: log into an existing admin
 *      description: the admin is logged in after validation of his email and password. A JWT access token with a duration of 1h and a JWT refresh token are returned.
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
      const accessToken = generateAccessToken(admin.toJSON());
      const refreshToken = jwt.sign(
        admin.toJSON(),
        process.env.REFRESH_TOKEN_SECRET
      );
      refreshTokens.push(refreshToken);
      res
        .status(200)
        .json({ accessToken: accessToken, refreshToken: refreshToken });
    } else {
      res.status(401).send("Not allowed");
    }
  } catch {
    res.status(500).send();
  }
});

/**
 * @swagger
 * /admins/token:
 *  post:
 *      tags: [admin]
 *      summary: returns a new fresh access token
 *      description: the admin is given another fresh JWT token access token after having recognized his JWT refresh token.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json
 *      responses:
 *          '403':
 *              description: 'forbidden'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '401':
 *              description: 'unauthorized, unknown refresh token'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *          '200':
 *              description: 'new refresh token'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *
 */
router.post("/token", (req, res) => {
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
 *      summary: logs a admin out
 *      description: the given JWT refresh token of a admin is removed from the JWT refresh token list, preventing the creation of new JWT access tokens.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json
 *      responses:
 *          '204':
 *              description: 'no content, logout'
 *
 */
router.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

/**
 * @swagger
 * /admins/updateAdmin/{id}:
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
router.patch(
  "/updateAdmin/:id",
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
  }
);

/**
 * @swagger
 * /admins/deleteadmin/{id}:
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
router.delete(
  "/deleteadmin/:id",
  authenticateToken,
  getAdmin,
  async (req, res) => {
    try {
      await res.admin.deleteOne();
      res.status(200).json({ message: "Deleted Admin" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

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

function generateAccessToken(admin) {
  return jwt.sign(admin, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
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
router.get(
  "/studentManager/getstudents",
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
router.get(
  "/studentManager/getstudent/:id",
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
 *      summary: update an existing target student
 *      description: the authenticate admin changes some of target student university-related datas like email, student id, study course and study year.
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
router.patch(
  "/studentManager/updatestudent/:id",
  authenticateToken,
  getStudent,
  async (req, res) => {
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
  }
);

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
router.delete(
  "/studentManager/deletestudent/:id",
  authenticateToken,
  getStudent,
  async (req, res) => {
    try {
      await res.student.deleteOne();
      res.json({ message: "Deleted Student" });
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
 *      summary: create a new event
 *      description: the admin creates an event in google calendar, the informations are stored also in mongodb.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          summary:
 *                              type: String
 *                          start:
 *                              type: Date
 *                          end:
 *                              type: Date
 *                          description:
 *                              type: String
 *                          location:
 *                              type: String
 *                          colorID:
 *                              type: String
 *      responses:
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
router.get("/eventManager/createEvent", authenticateToken, async (req, res) => {
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
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 10 },
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
    keyFile: "./google-calendar-key-path.json",
    scopes: "https://www.googleapis.com/auth/calendar",
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
          console.log(
            "There was an error contacting the Calendar service: " + err
          );
          res.status(500).json({ message: err.message });
          return;
        }
        const newEvent = await mongo_event.save();
        console.log("Event created: %s", event.data);
        //res.status(201).jsonp("Event successfully created!");
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
 *      summary: update an existing event
 *      description: the admin changes some of the event informations like summary, start date, end date, description and location. NB this changes are visible only in the database, the changes in google calendar are set up directly there.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          summary:
 *                              type: String
 *                          start:
 *                              type: String
 *                          description:
 *                              type: String
 *                          location:
 *                              type: String
 *      responses:
 *          '400':
 *              description: 'Bad request'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: String
 *          '404':
 *              description: 'student not found'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: String
 *          '500':
 *              description: 'database internal error'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: String
 *          '202':
 *              description: 'event information updated succesfully'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: String
 *
 */
router.patch(
  "/eventManager/updateevent/:id",
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
 *      summary: remove target event
 *      description: the event identified by the provided id is removed from the event list in mongodb
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
router.delete(
  "/eventManager/deleteevent/:id",
  authenticateToken,
  getEvent,
  async (req, res) => {
    try {
      await res.event.deleteOne();
      res.status(200).json({ message: "Deleted Event" });
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
 *      summary: register a new classroom
 *      description: the classroom is created by the authenticated admin after a code-validation check with the input parameters.
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
 *                              type: int
 *                          available:
 *                              type: boolean
 *      responses:
 *          '409':
 *              description: 'Classroom code already in use'
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
 *              description: 'classroom successfully registered'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              state:
 *                                  type: string
 *
 */
router.post(
  "/classroomManager/createClassroom",
  authenticateToken,
  async (req, res) => {
    const duplicateClass = await Classroom.findOne({ code: req.body.code });
    if (duplicateClass != null) {
      return res.status(409).json({ message: "Classroom code already exists" });
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
 *      summary: reset all room bookings
 *      description: the admin sets all classrooms available. Is better to call this function at the end of the day.
 *      responses:
 *          '500':
 *              description: 'database internal error'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *          '202':
 *              description: 'classroom availability updated succesfully to true'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *
 */
router.patch(
  "/classroomManager/resetBooking",
  authenticateToken,
  async (req, res) => {
    try {
      await Classroom.updateMany(
        { available: false },
        { $set: { available: true } }
      );
      res.status(202).json({ message: "All classroom are now available" });
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
  "/surveyManager/createSurvey",
  authenticateToken,
  async (req, res) => {
    const duplicateSurvey = await Survey.findOne({ link: req.body.link });
    if (duplicateSurvey != null) {
      return res.status(409).json({ message: "Survey already exists" });
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
  "/surveyManager/deleteSurvey/:id",
  authenticateToken,
  async (req, res) => {
    try {
      await res.survey.deleteOne();
      res.status(200).json({ message: "Deleted Survey" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
