const express = require('express');
const router = express.Router();
const Survey = require('../models/survey');
const authenticateToken = require("../middlewares/authenticateToken");

/**
 * @swagger
 * /surveys/getsurveys:
 *  get:
 *      tags: [survey]
 *      summary: get all surveys
 *      description: a list of all surveys is returned. Only authenticated users can access the links, both students or admins.
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
 *              description: 'Success: return the list of surveys'
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              searchingList:
 *                                  type: list
 *
 */
router.get("/getsurveys", authenticateToken, async (req, res) => {
  try {
    const surveys = await Survey.find();
    res.status(200).json(surveys);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
