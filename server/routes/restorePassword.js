const express = require("express");
const router = express.Router();
const mongoose = require("../db/database").mongoose;
const jwt = require("jsonwebtoken");
const https = require('https');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "TEST SECRET KEY SHOULD BE CHANGED BEFORE PRODUCTION";

const MJ_APIKEY_PUBLIC = process.env.MJ_APIKEY_PUBLIC;
const MJ_APIKEY_PRIVATE = process.env.MJ_APIKEY_PRIVATE;


async function sendEmail(email, name, token){

	const options = {
		hostname: 'api.mailjet.com',
		port: 443,
		path: '/v3.1/send',
		method: 'POST',
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Basic " + Buffer.from(`${MJ_APIKEY_PUBLIC}:${MJ_APIKEY_PRIVATE}`).toString("base64")
		}
	};

	const data = JSON.stringify({
		Messages: [{
			From: {
				Email: "noreply.why.social@gmail.com",
				Name: "Why Social"
			},
			To: [{
				Email: email,
				Name: name
			}],
			Subject: "Password reset",
			TextPart: `Hello, click on the following link to restore your password: http://localhost:3000/restorePassword?token=${token}`,
		}]
	});
	
	return new Promise((resolve, reject) => {
		const req = https.request(options, (res) => {
			let responseData = '';

			res.on('data', (chunk) => {
				responseData += chunk;
			});

			res.on('end', () => {
				if(res.statusCode !== 200)
					return reject(new Error(`Mailjet API returned status code ${res.statusCode}: ${responseData}`));
				resolve(responseData);
			});
		});
		req.on('error', (e) => {
			reject(e);
		});
		req.write(data);
		req.end();
	});
}

class ValidationError extends Error {
	constructor(message) {
		super(message);
		this.name = 'ValidationError';
		this.statusCode = 400;
	}
}

class NotFoundError extends Error {
	constructor(message) {
		super(message);
		this.name = 'NotFoundError';
		this.statusCode = 404;
	}
}

router.post("/api/v1/restorePassword", async (req, res, next) => {
	try {
		const { email } = req.body;

		// Check if ID is provided
		if(!email)
			throw new ValidationError("Email is required");
		
		// Check if user exists
		const user = await mongoose.models["Users"].findOne({email});
		if(!user)
			throw new NotFoundError("User not found");

		// Generate a temporary token
		const token = jwt.sign({userId: user._id}, JWT_SECRET_KEY, {expiresIn: "1h"});

		// Send an email with the token
		await sendEmail(user.email, user.username, token);

		res.status(200).json({ // status 200 because no resource is being created
			message: "Email sent",
		});
	} catch (error) {
		next(error);
	}
});


router.use((err, req, res, next) => {
	if (err instanceof ValidationError || err instanceof NotFoundError) {
		return res.status(err.statusCode).json({ message: err.message });
	}

	console.error(err.stack);
	res.status(500).json({message: "Server error"});
});


module.exports = router;