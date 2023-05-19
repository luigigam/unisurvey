const express = require('express')
const router = express.Router()
const Admin = require ('../models/admin')
const bcrypt = require("bcrypt")
const hashing = require("../middlewares/encrypt_pssw")
const jwt = require('jsonwebtoken')
const authenticateToken = require("../middlewares/authenticateToken")
const validateEmail = require("../middlewares/validateEmail")

//Getting all
router.get('/', async (req,res) => {
    try {
        const admins = await Admin.find()
        res.json(admins)
    } catch {
        res.status(500).json({ message: err.message })
    }
})

//Getting one
router.get('/:id', getAdmin, async (req,res) => {
    res.json(res.admin)
})

/**
 * @swagger
 * /admins/signup:
 *  post:
 *      tags: [admin]
 *      summary: register a new admin
 *      description: the admin is created after a bunch of checks over the submitted data (email already present in the database, valid email address, password length). An JWT access token is returned and saved as a cookie to keep the user logged.
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
 *              description: 'database error'
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
router.post('/signup', async (req,res) => {
    const duplicateUser = await Admin.findOne({'email': req.body.email});
    if (duplicateUser != null) {
      return res.status(409).json({ message: 'email-already-in-use' })
    }
    if (!validateEmail(req.body.email)) {
      return res.status(400).json({state: 'invalid-email'})
    }
    const hashed = await hashing(req.body.password)
    const admin = new Admin({
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        password: hashed
    })
    try {
        const newAdmin = await admin.save()
        res.status(201).json(newAdmin)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

/**
 * @swagger
 * /admins/login:
 *  post:
 *      tags: [admin]
 *      summary: log into an existing admin
 *      description: the admin is logged in after validation of his email and password. A JWT token is returned.
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
  const admin = await Admin.findOne({ email: req.body.email })
  if (admin == null) {
    return res.status(404).send('Cannot find admin')
  }
  try {
    if (await bcrypt.compare(req.body.password, admin.password)) {
      const accessToken = jwt.sign(admin.toJSON(), process.env.ACCESS_TOKEN_SECRET)
      res.json({ accessToken: accessToken })
    } else {
      res.status(401).send('Not allowed')
    }
  } catch {
    res.status(500).send()
  }
})

//Updating one
router.patch('/:id', getAdmin, async (req,res) => {
  if (req.body.name != null) {
    res.admin.name = req.body.name
  }
  if (req.body.surname != null) {
    res.admin.surname = req.body.surname
  }
  if (req.body.email != null) {
    res.admin.email = req.body.email
  }
  if (req.body.password != null) {
    res.admin.password = req.body.password
  }
  try {
    const updatedAdmin = await res.admin.save()
    res.json(updatedAdmin)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Deleting One
router.delete("/:id", getAdmin, async (req, res) => {
	try {
		await res.admin.deleteOne()
		res.json({ message: "Deleted Admin" })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

//Home
router.post('/home', authenticateToken, (req, res) => {
  res.send('Homepage')
})
  
async function getAdmin(req, res, next) {
  let admin
  try {
    admin = await Admin.findById(req.params.id)
    if (admin == null) {
      return res.status(404).json({ message: 'Cannot find admin' })
    }
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }

  res.admin = admin
  next()
}

module.exports = router