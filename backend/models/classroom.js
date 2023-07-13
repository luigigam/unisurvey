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

classroomSchema.virtual("reservations", {
  ref: "Reservation",
  localField: "_id",
  foreignField: "classroom",
});

const Classroom = mongoose.model("Classroom", classroomSchema);
module.exports = Classroom;
