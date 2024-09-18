const express = require("express");
const router = express.Router();
const mongoose = require("../db/database").mongoose;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "TEST SECRET KEY SHOULD BE CHANGED BEFORE PRODUCTION";

const errorMsg = {
	REQUIRED_FIELDS: "All fields are required",
	USER_NOT_FOUND: "User not found",
	INCORRECT_PASSWORD: "Incorrect password",
};

class ValidationError extends Error {
	constructor(message) {
		super(message);
		this.name = 'ValidationError';
		this.statusCode = 400;
	}
}

class UnauthorizedError extends Error {
	constructor(message) {
		super(message);
		this.name = 'UnauthorizedError';
		this.statusCode = 401;
	}
}

class NotFoundError extends Error {
	constructor(message) {
		super(message);
		this.name = 'NotFoundError';
		this.statusCode = 404;
	}
}

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

		const token = jwt.sign({userId: user._id}, JWT_SECRET_KEY, {expiresIn: "1h"});

		res.json({
			message: "Login successful",
			user_id: user._id,
			token
		});
	} catch (err){
		next(err);
	}
});


//#region Error handler
router.use((err, req, res, next) => {
	if (err instanceof ValidationError || err instanceof UnauthorizedError || err instanceof NotFoundError) {
		return res.status(err.statusCode).json({ message: err.message });
	}

	console.error(err.stack);
	res.status(500).json({message: "Server error"});
});
//#endregion


module.exports = router;