const Student = require ('../models/student')

async function getStudent(req, res, next) {
    let student
    try {
      student = await Student.findById(req.params.id)
      if (student == null) {
        return res.status(404).json({ message: 'Cannot find student' })
      }
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  
    res.student = student
    next()
}

module.exports = getStudent