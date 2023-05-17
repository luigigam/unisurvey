const express = require('express')
const router = express.Router()
const Event = require ('../models/event')

//Getting all
router.get('/', async (req,res) => {
    try {
        const events = await Event.find()
        res.json(events)
    } catch {
        res.status(500).json({ message: err.message })
    }
})

//Getting one
router.get('/:id', getEvent, async (req,res) => {
    res.json(res.event)
})

//Creating one
router.post('/', async (req,res) => {
    const event = new Event({
      name: req.body.name,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      description: req.body.description,
      location: req.body.location,
      isRegular: req.body.isRegular
    })

    try {
        const newEvent = await event.save()
        res.status(201).json(newEvent)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

//Updating one
router.patch('/:id', getEvent, async (req,res) => {
  if (req.body.name != null) {
    res.event.name = req.body.name
  }
  if (req.body.surname != null) {
    res.event.surname = req.body.surname
  }
  if (req.body.gender != null) {
    res.event.gender = req.body.gender
  }
  if (req.body.email != null) {
    res.event.email = req.body.email
  }
  if (req.body.password != null) {
    res.event.password = req.body.password
  }
  if (req.body.student_id != null) {
    res.event.student_id = req.body.student_id
  }
  if (req.body.study_course != null) {
    res.event.study_course = req.body.study_course
  }
  if (req.body.study_year != null) {
    res.event.study_year = req.body.study_year
  }
  try {
    const updatedEvent = await res.event.save()
    res.json(updatedEvent)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Deleting One
router.delete("/:id", getEvent, async (req, res) => {
	try {
		await res.event.deleteOne()
		res.json({ message: "Deleted Event" })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

async function getEvent(req, res, next) {
  let event
  try {
    event = await Event.findById(req.params.id)
    if (event == null) {
      return res.status(404).json({ message: 'Cannot find event' })
    }
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }

  res.event = event
  next()
}

module.exports = router