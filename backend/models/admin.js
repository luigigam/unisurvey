const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }],
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    surveys: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Survey' }]
})

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;