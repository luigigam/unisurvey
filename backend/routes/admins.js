const express = require('express')
const router = express.Router()
const Admin = require ('../models/admin')
const bcrypt = require("bcrypt")
const hashing = require("../middlewares/encrypt_pssw")

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

//Creating one
router.post('/', async (req,res) => {
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
        res.status(400).json({ message: err.message })
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

//Login
router.post('/login', async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email })
  if (admin == null) {
    return res.status(400).send('Cannot find admin')
  }
  try {
    if (await bcrypt.compare(req.body.password, admin.password)) {
      res.send('Success')
    } else {
      res.send('Not allowed')
    }
  } catch {
    res.status(500).send()
  }
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
