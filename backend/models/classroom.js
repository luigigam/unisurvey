const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  seats: {
    type: Number,
    required: true,
  },
  available: {
    type: Boolean,
    required: true,
    default: true,
  },
});

/*classroomSchema.statics.findAvailableByCode = function (code) {
  return this.findOne({ code: code, available: true });
};*/

const Classroom = mongoose.model("Classroom", classroomSchema);
module.exports = Classroom;
