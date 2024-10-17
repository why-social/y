const express = require("express");
const router = express.Router();
const mongoose = require("../db/database").mongoose;
const jwt = require("jsonwebtoken");
const https = require('https');
const { AppError, ValidationError, NotFoundError, errorMsg } = require("../utils/errors");
const { secrets } = require("../utils/utils");

const { JWT_SECRET_KEY, MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE } = secrets;


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
			TextPart: `Hello, click on the following link to restore your password: http://localhost:5173/restorePassword?token=${token}`,
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
					return reject(new AppError(`Mailjet API returned status code ${res.statusCode}: ${responseData}`));
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

router.post("/api/v1/restorePassword", async (req, res, next) => {
	try {
		const { email } = req.body;

		// Check if ID is provided
		if(!email)
			throw new ValidationError(errorMsg.REQUIRED_FIELDS);
		
		// Check if user exists
		const user = await mongoose.models["Users"].findOne({email});
		if(!user)
			throw new NotFoundError(errorMsg.USER_NOT_FOUND);

		// Generate a temporary token
		const token = jwt.sign({userId: user._id, username: user.username}, JWT_SECRET_KEY, {expiresIn: "1h"}); // TODO: shorter expiry

		// Send an email with the token
		await sendEmail(user.email, user.username, token);

		res.status(200).json({ // status 200 because no resource is being created
			message: "Email sent",
		});
	} catch (error) {
		next(error);
	}
});

module.exports = router;