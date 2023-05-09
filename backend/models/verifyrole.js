//verify role
const isAdmin = (req, res, next) => {
    if (req.user.role === 'Administration') {
      return next()
    }
    return res.status(403).json({ message: 'You are not authorized to access this resource' })
  }