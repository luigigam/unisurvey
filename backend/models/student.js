const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
    /*id: {

    },
    name: {

    },
    surname: {

    },
    gender: {

    },
    role: {

    },
    email: {

    },
    password: {

    }*/
    student_id:{
        type: String,
        required: true
    },
    study_course:{
        type: String,
        required: true
    },
    study_year:{
        type: Date,
        required: true,
        default: Date.now
    }
})

module.exports = mongoose.model('Student', studentSchema)