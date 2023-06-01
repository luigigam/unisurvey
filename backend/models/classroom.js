const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: true
  },
  descrizione: {
    type: String,
    required: true
  },
  posti: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Classroom', classroomSchema);
