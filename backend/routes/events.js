const express = require('express')
const router = express.Router()
const Event = require ('../models/event')
const getEvent = require("../middlewares/getEvent")
const Classroom = require('../models/classroom');
const Booking = require('../models/booking');
/**
 * @swagger
 * /events:
 *  get:
 *      tags: [events]
 *      summary: search all events
 *      description: a list of all events created is returned.
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
 *              description: 'Success: return the list of evetns'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              searchingList:
 *                                  type: list
 *
 */
router.get('/', async (req,res) => {
    try {
        const events = await Event.find()
        res.json(events)
    } catch {
        res.status(500).json({ message: err.message })
    }
})

/**
 * @swagger
 * /events/{id}:
 *  get:
 *      tags: [events]
 *      summary: search event by id
 *      description: an event is submitted and the event matching that particular id is returned.
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
 *              description: 'Success: return specified event by id'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              searchingList:
 *                                  type: list
 *
 */
router.get('/:id', getEvent, async (req,res) => {
    res.status(200).json(res.event)
})


/**
 * @swagger
 * /classrooms/book:
 *  post:
 *      tags: [classrooms]
 *      summary: Book a classroom
 *      description: Book a classroom based on hourly availability
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          classroomId:
 *                              type: string
 *                          startTime:
 *                              type: string
 *                              format: date-time
 *                          endTime:
 *                              type: string
 *                              format: date-time
 *                          details:
 *                              type: string
 *      responses:
 *          '200':
 *              description: 'Booking successful'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *          '400':
 *              description: 'Bad request'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *          '409':
 *              description: 'Classroom already booked'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 */
router.post('/book', async (req, res) => {
    const { classroomId, startTime, endTime, details } = req.body;
  
    try {
      const classroom = await Classroom.findById(classroomId);
  
      if (!classroom) {
        return res.status(404).json({ message: 'Classroom not found' });
      }
  
      // Check if the classroom is already booked during the requested time slot
      const existingBooking = await Booking.findOne({
        classroom: classroomId,
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      });
  
      if (existingBooking) {
        return res.status(409).json({ message: 'Classroom already booked' });
      }
  
      // Create a new booking
      const booking = new Booking({
        classroom: classroomId,
        startTime,
        endTime,
        details
      });
  
      await booking.save();
  
      return res.status(200).json({ message: 'Booking successful' });
    } catch (error) {
      console.error('Error booking classroom:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
module.exports = router