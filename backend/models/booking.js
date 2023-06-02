const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  aula: {
    type: String,
    required: true
  },
  data: {
    type: Date,
    required: true
  },
  fasciaOraria: {
    type: String,
    required: true
  },
  seat: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
