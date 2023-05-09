const bcrypt = require("bcrypt")

async function hashing(pssw) {
	try {
		const salt = await bcrypt.genSalt()
		const hashed = await bcrypt.hash(pssw, salt)
		return hashed
	} catch {
		res.status(500).send()
	}
}

module.exports = hashing