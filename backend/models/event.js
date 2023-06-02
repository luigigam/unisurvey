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
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isRegular: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
