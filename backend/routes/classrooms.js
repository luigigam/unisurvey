const express = require('express');
const router = express.Router();
const Classroom = require('../models/classroom');

/**
 * @swagger
 * /classrooms:
 *  get:
 *    tags: [classrooms]
 *    summary: Get all classrooms
 *    description: Retrieve all classrooms and sort them by name.
 *    responses:
 *      '200':
 *        description: 'Success: classrooms retrieved'
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                classrooms:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Classroom'
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

router.get('/', async (req, res) => {
  try {
    const classrooms = await Classroom.find().sort('name');
    res.json({ classrooms });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /classrooms/sort/seats:
 *  get:
 *    tags: [classrooms]
 *    summary: Get all classrooms sorted by number of seats
 *    description: Retrieve all classrooms and sort them by the number of seats.
 *    responses:
 *      '200':
 *        description: 'Success: classrooms retrieved'
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                classrooms:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Classroom'
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
router.get('/sort/seats', async (req, res) => {
  try {
    const classrooms = await Classroom.find().sort('-seats');
    res.json({ classrooms });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /classrooms/sort/location:
 *  get:
 *    tags: [classrooms]
 *    summary: Get all classrooms sorted by location
 *    description: Retrieve all classrooms and sort them by the location.
 *    responses:
 *      '200':
 *        description: 'Success: classrooms retrieved'
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                classrooms:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Classroom'
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

router.get('/sort/location', async (req, res) => {
  try {
    const classrooms = await Classroom.find().sort('location');
    res.json({ classrooms });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
