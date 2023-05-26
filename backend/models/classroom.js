const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  numberOfSeats: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Classroom', classroomSchema);
