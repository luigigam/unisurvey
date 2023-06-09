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

let refreshTokens = []

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
      const accessToken = generateAccessToken(admin.toJSON())
      const refreshToken = jwt.sign(
        admin.toJSON(),
        process.env.REFRESH_TOKEN_SECRET
      );
      refreshTokens.push(refreshToken)
      res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken });
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
	const refreshToken = req.body.token
	if (refreshToken == null) return res.status(401)
	if (!refreshTokens.includes(refreshToken)) return res.status(403)
	jwt.verify(
		refreshToken,
		process.env.REFRESH_TOKEN_SECRET,
		async (err, admin) => {
			if (err) return res.status(403)
			admin = await Admin.findOne({ email: admin.email })
			const accessToken = generateAccessToken(admin.toJSON())
			res.json({ accessToken: accessToken })
		}
	)
})

/**
 * @swagger
 * /admins/token:
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
 */router.delete("/logout", (req, res) => {
	refreshTokens = refreshTokens.filter((token) => token !== req.body.token)
	res.sendStatus(204)
})

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

function generateAccessToken(admin) {
	return jwt.sign(admin, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
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
router.get("/studentManager/getstudent/:id", getStudent, async (req, res) => {
  res.status(200).json(res.student);
});

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
      res
        .status(400)
        .json({ state: "Start Date cannot be later than End Date" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/createEvent", (req, res) => {
  var event = {
    summary: req.body.name.toISOString(),
    location: `${req.body.location}`,
    description: `${req.body.description}`,
    start: {
      dateTime: "2023-07-15T09:00:00-07:00",
    },
    end: {
      dateTime: "2023-07-15T17:00:00-07:00",
    },
    attendees: [],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 10 },
      ],
    },
  };

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
      function (err, event) {
        if (err) {
          console.log(
            "There was an error contacting the Calendar service: " + err
          );
          res.status(500).json({ message: err.message });
          return;
        }
        console.log("Event created: %s", event.data);
        res.status(201).jsonp("Event successfully created!");
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
    if (res.body.startDate <= res.body.endDate) {
      const updatedEvent = await res.event.save();
      res.status(202).json(updatedEvent);
    } else {
      res
        .status(400)
        .json({ state: "Start Date cannot be later than End Date" });
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
    await res.event.deleteOne();
    res.json({ message: "Deleted Event" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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

module.exports = router;
