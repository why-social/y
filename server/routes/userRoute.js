const express = require("express");
const router = express.Router();
const mongoose = require("../db/createDB").mongoose;
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "TEST SECRET KEY SHOULD BE CHANGED BEFORE PRODUCTION";


/**
 * Password regex
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character
 */
const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).*$/;

/**
 * Email regex
 * - Must contain @
 * - Must contain .
 * - Must not contain spaces
 * - Must have at least 1 character before and after @
 * - Must have at least 1 character before and after .
 * - Must have at least 1 character after the last .
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Username regex
 * - Only letters, numbers and underscores
 */
const usernameRegex = /^[a-zA-Z0-9_]+$/;

/**
 * Name regex
 * - Only letters and spaces
 */
const nameRegex = /^[a-zA-Z\s]+$/;

const errorMessages = [
	"All fields are required",
	"Name is invalid",
	"Username is invalid",
	"Email is invalid",
	"Password is invalid",
	"Birthday is invalid",
	"User with this username already exists",
	"User with this email already exists",
].map((el, i) => {return {message: el, errCode: i}});

//#region GET
router.get("/api/v1/user/:id", authMiddleware, async (req, res) => {
	try {
		// Get user by id from db
		let result = await mongoose.models["Users"].findById(req.params.id).exec();

		// If user not found return 404
		if(!result) return res.status(404).json({message: "User not found"});

		let partialResponse = {
			name: result.name,
			email: result.email,
			about_me: result.about_me,
			username: result.username,
			join_date: result.join_date,
			birthday: result.birthday,
			last_time_posted: result.last_time_posted,
			profile_picture: result.profile_picture,
		}

		// If user is not authenticated, do not return email
		if(!req.isAuth) delete partialResponse.email;

		res.json(partialResponse);
	} catch (err) {
		res.status(500).json({message: "Server error"});
	}
});

router.get("/api/v1/user/:id/followers", async (req,res) => {
	try{
		let result = await mongoose.models["User_follows_user"].find({follows: req.params.id}).exec();
		if(!result) return res.status(404).json({message: "User not found"});
		res.json(result);
	} catch (err) {
		res.status(500).json({message: "Server error"});
	}
});

router.get("/api/v1/user/:id/following", async (req,res) => {
	try{
		let result = await mongoose.models["User_follows_user"].find({follower: req.params.id}).exec();
		if(!result) return res.status(404).json({message: "User not found"});
		res.json(result);
	} catch (err) {
		res.status(500).json({message: "Server error"});
	}
});
//#endregion

//#region POST
router.post("/api/v1/users", async (req,res) => {
	try{
		// Check if all the necessary fields are present
		if(!req.body.name || 
			!req.body.email || 
			!req.body.password || 
			!req.body.username ||
			!req.body.birthday)
			return res.status(400).json(errorMessages[0]);

		// Check the length and validity of fields
		if(req.body.name.length < 3 || req.body.name.length > 40 || !nameRegex.test(req.body.name)) 
			return res.status(400).json(errorMessages[1]);
		if(req.body.username.length < 3 || req.body.username.length > 20 || !usernameRegex.test(req.body.username))
			return res.status(400).json(errorMessages[2]);
		if(req.body.email.length < 3 || req.body.email.length > 40 || !emailRegex.test(req.body.email))
			return res.status(400).json(errorMessages[3]);
		if(req.body.password.length < 8 || req.body.password.length > 40 || !passwordRegex.test(req.body.password))
			return res.status(400).json(errorMessages[4]);
		
		// Check if birthday is a valid date
		const birthday = new Date(req.body.birthday);
		if(isNaN(birthday.getTime()) || birthday > new Date())
			return res.status(400).json(errorMessages[5]);

		// Check if user already exists by username
		let usernameExists = await mongoose.models["Users"].findOne({username: req.body.username}).exec();
		if(usernameExists) return res.status(400).json(errorMessages[6]);

		// Check if user already exists by email
		let emailExists = await mongoose.models["Users"].findOne({email: req.body.email}).exec();
		if(emailExists) return res.status(400).json(errorMessages[7]);

		// Remove all other fields from the request and add necessary
		req.body = {
			name: req.body.name,
			email: req.body.email,
			password: req.body.password,
			username: req.body.username,
			birthday: req.body.birthday,
			last_time_posted: null,
			about_me: "",
			profile_picture: null,
		}

		// Create new user and save to db
		let newUser = new mongoose.models["Users"](req.body);
		await newUser.save();

		// Create JWT token
		const token = jwt.sign({userId: newUser._id}, JWT_SECRET_KEY, {expiresIn: "15d"});

		// Return message, user id and token
		res.status(201).json({message: "User created", user_id: newUser._id, token: token});
	} catch (err) {
		res.status(500).json({message: "Server error"});
	}
});

//#endregion

module.exports = router;