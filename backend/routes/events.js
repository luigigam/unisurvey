require("dotenv").config();

const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const getEvent = require("../middlewares/getEvent");
const { google } = require('googleapis');
var calendar_constants = require("../middlewares/calendar_constants.js");

/**
 * @swagger
 * /events:
 *  get:
 *      tags: [event]
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
router.get("/getevents", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch {
    res.status(500).json({ message: err.message });
  }
});

router.get("/getevents", (req, res) => {
    calendar_constants.calendar.events.list(
    {
      calendarId: calendar_constants.GOOGLE_CALENDAR_ID,
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    },
    (error, result) => {
      if (error) {
        res.send(JSON.stringify({ error: error }));
      } else {
        if (result.data.items.length) {
          res.send(JSON.stringify({ events: result.data.items }));
        } else {
          res.send(JSON.stringify({ message: "No upcoming events found." }));
        }
      }
    }
  );
});

/**
 * @swagger
 * /events/{id}:
 *  get:
 *      tags: [event]
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
router.get("/:id", getEvent, async (req, res) => {
  res.status(200).json(res.event);
});

module.exports = router;
