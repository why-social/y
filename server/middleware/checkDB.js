const mongoose = require("../db/createDB").mongoose;

module.exports = (req, res, next) => {
	if(mongoose.connection.readyState === 1) next();
	else res.status(500).json({message: "Server error"});
}
