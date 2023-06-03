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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/*
router.post("/book", async (req, res) => {
  try {
    const { classroomCode, date, time } = req.body;

    // Check if the classroom is available for the given date and time
    const classroom = await Classroom.findAvailableByCode(classroomCode);
    if (!classroom) {
      return res
        .status(400)
        .json({ success: false, message: "The classroom is not available" });
    }

    // Perform any other business logic or validations before booking the classroom

    // Update the classroom's availability to false
    classroom.available = false;
    await classroom.save();

    return res
      .status(200)
      .json({ success: true, message: "Classroom booked successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "An error occurred while booking the classroom" });
  }
});
*/

module.exports = router;
