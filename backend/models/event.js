const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  summary: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  start: {
    type: String,
    required: true,
  },
  end: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  colorID: {
    type: String,
    default: "6",
  },
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
