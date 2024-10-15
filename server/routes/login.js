const express = require("express");
const router = express.Router();
const mongoose = require("../db/database").mongoose;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { ValidationError, UnauthorizedError, NotFoundError, errorMsg } = require("../utils/errors");
const { secrets } = require("../utils/utils"); 

const JWT_SECRET_KEY = secrets.JWT_SECRET_KEY;

router.post("/api/v1/login", async (req, res, next) => {
	try {
		const {username, password} = req.body;

		if (!username || !password)
			throw new ValidationError(errorMsg.REQUIRED_FIELDS);

		let user = await mongoose.models["Users"].findOne({username});
		if (!user)
			throw new NotFoundError(errorMsg.USER_NOT_FOUND);

		const match = await bcrypt.compare(password, user.password);
		if (!match)
			throw new UnauthorizedError(errorMsg.INCORRECT_PASSWORD);

		const token = jwt.sign({
      userId: user._id,
      username: user.username,
      isAdmin: (username === 'Admin')},
      JWT_SECRET_KEY,
      {expiresIn: "1h"}
    );

		res.status(200).json({
			message: "Login successful",
			user_id: user._id,
      username: user.username,
			token: token
		});
	} catch (err){
		next(err);
	}
});

module.exports = router;