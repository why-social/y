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
	"All fields are required", // 0
	"Name is invalid", // 1
	"Username is invalid", // 2
	"Email is invalid", // 3
	"Password is invalid", // 4
	"Birthday is invalid", // 5
	"User with this username already exists", // 6
	"User with this email already exists", // 7
	"User id is invalid", // 8
	"User not found", // 9
	"Following not found", // 10
	"Already following", // 11
].map((el, i) => {return {message: el, errCode: i}});

/**
 * Check if the id(s) in the request are valid
 * @param  {...String} args - Ids to check
 * @returns {Function} - Middleware function
 */
function checkIdValidity(...args) {
	return (req, res, next) => {
		for (let arg of args) {
			if(!mongoose.Types.ObjectId.isValid(req.params[arg]))
				return res.status(400).json(errorMessages[8]);
		};
		next();
	}
}

//#region GET
router.get("/api/v1/user/:id", authMiddleware, checkIdValidity("id"), async (req, res) => {
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
		if(!req.isAuth || user._id.toString() !== req.user.userId)
			delete partialResponse.email;

		res.json(partialResponse);
	} catch (err) {
		res.status(500).json({message: "Server error"});
	}
});

router.get("/api/v1/user/:id/followers", checkIdValidity("id"), async (req, res) => {
	try{
		let result = await mongoose.models["User_follows_user"].find({follows: req.params.id}).exec();
		if(!result) return res.status(404).json({message: "User not found"});
		res.json(result);
	} catch (err) {
		res.status(500).json({message: "Server error"});
	}
});

router.get("/api/v1/user/:id/following", checkIdValidity("id"), async (req, res) => {
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
router.post("/api/v1/users", async (req, res) => {
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

router.post("/api/v1/users/:id/following/:following_id", authMiddleware, checkIdValidity("id", "following_id"), async (req, res) => {
	try{
		// Check if the user is authenticated
		if(!req.isAuth) return res.status(401).json({message: "Unauthorized"});

		// Check if user exists
		let user = await mongoose.models["Users"].findById(req.params.user_id).exec();
		if(!user) return res.status(404).json(errorMessages[9]);

		// Check if the user is the same as the authenticated user
		if(user._id.toString() !== req.user.userId) return res.status(401).json({message: "Unauthorized"});

		// Check if following exists
		let following = await mongoose.models["Users"].findById(req.params.following_id).exec();
		if(!following) return res.status(404).json(errorMessages[10]);

		// Check if user is already following
		let alreadyFollowing = await mongoose.models["User_follows_user"].findOne({follower: req.params.user_id, follows: req.params.following_id}).exec();
		if(alreadyFollowing) return res.status(400).json(errorMessages[11]);

		// Create new following and save to db
		let newFollowing = new mongoose.models["User_follows_user"]({follower: req.params.user_id, follows: req.params.following_id});
		await newFollowing.save();

		res.status(201).json({message: "Following created"});
	} catch (err) {
		res.status(500).json({message: "Server error"});
	}
});
//#endregion

//#region PATCH
router.patch("/api/v1/user/:id", authMiddleware, checkIdValidity("id"), async (req, res) => {
	try{
		// Check if the user is authenticated
		if(!req.isAuth || user._id.toString() !== req.user.userId) return res.status(401).json({message: "Unauthorized"});

		// Check if the user exists
		let user = await mongoose.models["Users"].findById(req.params.id).exec();
		if(!user) return res.status(404).json(errorMessages[9]);

		// Check if the fields are valid
		if(req.body.name && (req.body.name.length < 3 || req.body.name.length > 40 || !nameRegex.test(req.body.name)))
			return res.status(400).json(errorMessages[1]);
		if(req.body.username && (req.body.username.length < 3 || req.body.username.length > 20 || !usernameRegex.test(req.body.username)))
			return res.status(400).json(errorMessages[2]);
		if(req.body.email && (req.body.email.length < 3 || req.body.email.length > 40 || !emailRegex.test(req.body.email)))
			return res.status(400).json(errorMessages[3]);
		if(req.body.birthday && (isNaN(new Date(req.body.birthday).getTime()) || new Date(req.body.birthday) > new Date()))
			return res.status(400).json(errorMessages[5]);

		// Check if the new username already exists
		if(req.body.username) {
			let usernameExists = await mongoose.models["Users"].findOne({username: req.body.username}).exec();
			if(usernameExists) return res.status(400).json(errorMessages[6]);
		}

		// Check if the new email already exists
		if(req.body.email) {
			let emailExists = await mongoose.models["Users"].findOne({email: req.body.email}).exec();
			if(emailExists) return res.status(400).json(errorMessages[7]);
		}

		// Update user fields
		if(req.body.name) user.name = req.body.name;
		if(req.body.email) user.email = req.body.email;
		if(req.body.username) user.username = req.body.username;
		if(req.body.birthday) user.birthday = req.body.birthday;
		if(req.body.about_me) user.about_me = req.body.about_me;
		if(req.body.profile_picture) user.profile_picture = req.body.profile_picture;

		await user.save();
		res.json({message: "User updated"});
	} catch (err) {
		res.status(500).json({message: "Server error"});
	}
});
//#endregion

module.exports = router;