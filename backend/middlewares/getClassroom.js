const Classroom = require("../models/classroom");

async function getClassroom(req, res, next) {
  let classroom;
  try {
    classroom = await Classroom.findById(req.params.id);
    if (classroom == null) {
      return res.status(404).json({ message: "Cannot find classroom" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.classroom = classroom;
  next();
}

module.exports = getClassroom;
