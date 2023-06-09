const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  targetYear: {
    type: String,
    required: true
  },
  targetCourse: {
    type: String,
    required: true
  },
  targetID: {
    type: String,
    required: true
  },
});

const Survey = mongoose.model("Survey", surveySchema);
module.exports = Survey;
