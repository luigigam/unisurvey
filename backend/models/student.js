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
});

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
