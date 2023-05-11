require('dotenv').config()

const express = require('express')
const router = express.Router()
const Student = require ('../models/student')
const bcrypt = require("bcrypt")
const hashing = require("../middlewares/encrypt_pssw")
const jwt = require('jsonwebtoken')
const authenticateToken = require("../middlewares/authenticateToken")

//Getting all
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

//Creating one
router.post('/', async (req,res) => {
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
        res.status(400).json({ message: err.message })
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

//Login
router.post('/login', async (req, res) => {
  const student = await Student.findOne({ email: req.body.email })
  if (student == null) {
    return res.status(400).send('Cannot find student')
  }
  try {
    if (await bcrypt.compare(req.body.password, student.password)) {
      const accessToken = jwt.sign(student.toJSON(), process.env.ACCESS_TOKEN_SECRET)
      res.json({ accessToken: accessToken })
    } else {
      res.send('Not allowed')
    }
  } catch {
    res.status(500).send()
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
