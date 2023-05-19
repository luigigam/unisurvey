require('dotenv').config()

const express = require('express')
const router = express.Router()
const Student = require ('../models/student')
const bcrypt = require("bcrypt")
const hashing = require("../middlewares/encrypt_pssw")
const jwt = require('jsonwebtoken')
const authenticateToken = require("../middlewares/authenticateToken")
const validateEmail = require("../middlewares/validateEmail")

//Getting All
router.get('/', async (req,res) => {
    try {
        const students = await Student.find()
        res.json(students)
    } catch {
        res.status(500).json({ message: err.message })
    }
})

//Getting one
router.get('/:id', getStudent, async (req,res) => {
    res.json(res.student)
})

/**
 * @swagger
 * /students/signup:
 *  post:
 *      tags: [student]
 *      summary: register a new student
 *      description: the student is created after a bunch of checks over the submitted data (email already present in the database, valid email address, password length). An JWT access token is returned and saved as a cookie to keep the user logged.
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
router.post('/signup', async (req,res) => {
    const duplicateUser = await Student.findOne({'email': req.body.email});
    if (duplicateUser != null) {
      return res.status(409).json({ message: 'email-already-in-use' })
    }
    if (!validateEmail(req.body.email)) {
      return res.status(400).json({state: 'invalid-email'})
    }
    const hashed = await hashing(req.body.password)
    const student = new Student({
      name: req.body.name,
      surname: req.body.surname,
      gender: req.body.gender,
      email: req.body.email,
      password: hashed,
      student_id: req.body.student_id,
      study_course: req.body.study_course,
      study_year: req.body.study_year
    })

    try {
        const newStudent = await student.save()
        res.status(201).json(newStudent)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

/**
 * @swagger
 * /students/login:
 *  post:
 *      tags: [student]
 *      summary: log into an existing student
 *      description: the student is logged in after validation of his email and password. A JWT token is returned.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
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
router.post('/login', async (req, res) => {
  if (!validateEmail(req.body.email)) {
    return res.status(400).send('Invalid email')
  }
  const student = await Student.findOne({ email: req.body.email })
  if (student == null) {
    return res.status(404).send('Cannot find student')
  }
  try {
    if (await bcrypt.compare(req.body.password, student.password)) {
      const accessToken = jwt.sign(student.toJSON(), process.env.ACCESS_TOKEN_SECRET)
      res.status(200).json({ accessToken: accessToken })
    } else {
      res.status(401).send('Not allowed')
    }
  } catch {
    res.status(500).send()
  }
})

//Updating one
router.patch('/:id', getStudent, async (req,res) => {
  if (req.body.name != null) {
    res.student.name = req.body.name
  }
  if (req.body.surname != null) {
    res.student.surname = req.body.surname
  }
  if (req.body.gender != null) {
    res.student.gender = req.body.gender
  }
  if (req.body.email != null) {
    res.student.email = req.body.email
  }
  if (req.body.password != null) {
    res.student.password = req.body.password
  }
  if (req.body.student_id != null) {
    res.student.student_id = req.body.student_id
  }
  if (req.body.study_course != null) {
    res.student.study_course = req.body.study_course
  }
  if (req.body.study_year != null) {
    res.student.study_year = req.body.study_year
  }
  try {
    const updatedStudent = await res.student.save()
    res.json(updatedStudent)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Deleting One
router.delete("/:id", getStudent, async (req, res) => {
	try {
		await res.student.deleteOne()
		res.json({ message: "Deleted Student" })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

//Home
router.post('/home', authenticateToken, (req, res) => {
  res.send('Homepage')
})  

async function getStudent(req, res, next) {
  let student
  try {
    student = await Student.findById(req.params.id)
    if (student == null) {
      return res.status(404).json({ message: 'Cannot find student' })
    }
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }

  res.student = student
  next()
}

module.exports = router