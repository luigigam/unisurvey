const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  student_id: {
    type: String,
    required: true,
  },
  study_course: {
    type: String,
    required: true,
  },
  study_year: {
    type: String,
    required: true,
  },
  reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }],
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  surveys: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Survey' }]
});

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
