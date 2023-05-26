// backend/routes/bookings.js
const express = require('express');
const router = express.Router();
const Classroom = require('../models/classroom');

/**
 * @swagger
 * /bookings:
 *  post:
 *    tags: [bookings]
 *    summary: Book a classroom
 *    description: Book a classroom based on availability and other criteria.
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              classroomId:
 *                type: string
 *              startTime:
 *                type: string
 *              endTime:
 *                type: string
 *    responses:
 *      '200':
 *        description: 'Success: classroom booked'
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *      '404':
 *        description: 'Classroom not found or unavailable'
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *      '500':
 *        description: 'Internal server error'
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 */
router.post('/', async (req, res) => {
  try {
    const { classroomId, startTime, endTime } = req.body;

    const classroom = await Classroom.findById(classroomId);

    if (!classroom || !classroom.availability) {
      return res.status(404).json({ message: 'Classroom not found or unavailable' });
    }

    // Perform additional checks, such as checking if the classroom is available during the specified time slot

    // If all checks pass, update the classroom availability
    classroom.availability = false;
    await classroom.save();

    res.status(200).json({ message: 'Classroom booked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
