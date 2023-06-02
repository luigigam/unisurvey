const express = require("express");
const router = express.Router();
const Classroom = require("../models/classroom");

/**
 * @swagger
 * /classrooms/getclassrooms:
 *  get:
 *      tags: [classroom]
 *      summary: get all classrooms
 *      description: a list of all classrooms registered is returned.
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
 *              description: 'Success: return the list of classrooms'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              searchingList:
 *                                  type: list
 *
 */
router.get("/getclassrooms", async (req, res) => {
  try {
    const classrooms = await Classroom.find();
    res.status(200).json(classrooms);
  } catch {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
