require("dotenv").config();

const express = require("express");
const router = express.Router();
const Student = require("../models/student");
const bcrypt = require("bcrypt");
const hashing = require("../middlewares/encrypt_pssw");
const jwt = require("jsonwebtoken");
const getStudent = require("../middlewares/getStudent");
const authenticateToken = require("../middlewares/authenticateToken");
const validateEmail = require("../middlewares/validateEmail");
const Classroom = require("../models/classroom");
const getClassroom = require("../middlewares/getClassroom");

/**
 * @swagger
 * /students/signup:
 *  post:
 *      tags: [student]
 *      summary: register a new student
 *      description: the student is created after some validation checks.
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
 *                          gender:
 *                              type: string
 *                          email:
 *                              type: string
 *                          password:
 *                              type: string
 *                          student_id:
 *                              type: string
 *                          study_course:
 *                              type: string
 *                          study_year:
 *                              type: string
 *      responses:
 *          '409':
 *              description: 'email already in use: duplicate student'
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
 *              description: 'database error'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *          '201':
 *              description: 'student successfully created'
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
  const duplicateUser = await Student.findOne({ email: req.body.email });
  if (duplicateUser != null) {
    return res.status(409).json({ message: "email-already-in-use" });
  }
  if (!validateEmail(req.body.email)) {
    return res.status(400).json({ state: "invalid-email" });
  }
  const hashed = await hashing(req.body.password);
  const student = new Student({
    name: req.body.name,
    surname: req.body.surname,
    gender: req.body.gender,
    email: req.body.email,
    password: hashed,
    student_id: req.body.student_id,
    study_course: req.body.study_course,
    study_year: req.body.study_year,
  });

  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

let refreshTokens = [];

/**
 * @swagger
 * /students/login:
 *  post:
 *      tags: [student]
 *      summary: log into an existing student
 *      description: the student is logged in after validation of his email and password. A JWT access token with a duration of 1h and a JWT refresh token are returned.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          email:
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
  const student = await Student.findOne({ email: req.body.email });
  if (student == null) {
    return res.status(404).send("Cannot find student");
  }
  try {
    if (await bcrypt.compare(req.body.password, student.password)) {
      const accessToken = generateAccessToken(student.toJSON());
      const refreshToken = jwt.sign(
        student.toJSON(),
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
 * /students/token:
 *  post:
 *      tags: [student]
 *      summary: returns a new fresh access token
 *      description: the student is given another fresh JWT token access token after having recognized his JWT refresh token.
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
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, student) => {
      if (err) return res.status(403);
      student = await Student.findOne({ email: student.email });
      const accessToken = generateAccessToken(student.toJSON());
      res.status(200).json({ accessToken: accessToken });
    }
  );
});

/**
 * @swagger
 * /students/logout:
 *  delete:
 *      tags: [student]
 *      summary: logs a student out
 *      description: the given JWT refresh token of a student is removed from the JWT refresh token list, preventing the creation of new JWT access tokens.
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
  res.status(204);
});

/**
 * @swagger
 * /students/{id}:
 *  patch:
 *      tags: [student]
 *      summary: update an existing student
 *      description: the student changes some of his personal datas like name, surname, gender and password.
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
 *                          gender:
 *                              type: string
 *                          password:
 *                              type: string
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
router.patch("/:id", authenticateToken, getStudent, async (req, res) => {
  if (req.body.name != null) {
    res.student.name = req.body.name;
  }
  if (req.body.surname != null) {
    res.student.surname = req.body.surname;
  }
  if (req.body.gender != null) {
    res.student.gender = req.body.gender;
  }
  if (req.body.password != null) {
    const hashed = await hashing(req.body.password);
    res.student.password = hashed;
  }
  try {
    const updatedStudent = await res.student.save();
    res.status(202).json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

function generateAccessToken(student) {
  return jwt.sign(student, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
}

//Home
router.post("/home", authenticateToken, (req, res) => {
  res.send("Homepage");
});

/**
 * @swagger
 * /classroomsBooking/{id}:
 *  patch:
 *      tags: [student]
 *      summary: book a classroom if available
 *      description: the student books a classroom if available, otherwise that option is negated
 *      responses:
 *          '404':
 *              description: 'classoom not found'
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
 *              description: 'classroom booked succesfully'
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
  "/classroomsBooking/:id",
  authenticateToken,
  getClassroom,
  async (req, res) => {
    if (!res.classroom.available) {
      return res
        .status(400)
        .json({ state: "Classroom not available, can't be booked" });
    } else {
      res.classroom.available = false;
    }
    try {
      const updatedClassroom = await res.classroom.save();
      res.status(202).json(updatedClassroom);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
