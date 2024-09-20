const express = require("express");
const router = express.Router();
const mongoose = require("../db/database").mongoose;
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "TEST SECRET KEY SHOULD BE CHANGED BEFORE PRODUCTION";


/**
 * Password regex
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character
 * - Length between 8 and 40
 */
const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,40}$/;

/**
 * Email regex
 * - Must contain @
 * - Must contain .
 * - Must not contain spaces
 * - Must have at least 1 character before and after @
 * - Must have at least 1 character before and after .
 * - Length between 3 and 40
 */
const emailRegex = /^(?=.{3,40}$)[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Username regex
 * - Only letters, numbers and underscores
 * - Length between 3 and 20
 */
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

/**
 * Name regex
 * - Only letters and spaces
 * - Length between 3 and 40
 */
const nameRegex = /^[a-zA-Z ]{3,40}$/;

/**
 * Fields that can be updated
 */
const updatableFields = ['name', 'email', 'username', 'birthday', 'about_me', 'profile_picture'];

const errorMsg = {
	REQUIRED_FIELDS: "All fields are required",
	INVALID_NAME: "Name is invalid",
	INVALID_USERNAME: "Username is invalid",
	INVALID_EMAIL: "Email is invalid",
	INVALID_PASSWORD: "Password is invalid",
	INVALID_BIRTHDAY: "Birthday is invalid",
	USERNAME_EXISTS: "User with this username already exists",
	EMAIL_EXISTS: "User with this email already exists",
	INVALID_USER_ID: "User id is invalid",
	USER_NOT_FOUND: "User not found",
	FOLLOWING_NOT_FOUND: "Following not found",
	ALREADY_FOLLOWING: "Already following",
	UNAUTHORIZED: "Unauthorized",
};

/**
 * Check if the id(s) in the request are valid
 * @param {...String} args - Ids to check
 * @returns {Function} - Middleware function
 */
function checkIdValidity(id) {
	return (req, res, next) => {
		if(!mongoose.Types.ObjectId.isValid(req.params[id]))
			return next(new ValidationError(errorMsg.INVALID_USER_ID));
		next();
	}
}

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

//#region GET
router.get("/api/v1/users/search", async (req, res, next) => {
	try{
		// Check if the search query is present
		if(!req.query.username) throw new ValidationError(errorMsg.REQUIRED_FIELDS);

		// Check username validity
		if(!usernameRegex.test(req.query.username)) throw new ValidationError(errorMsg.INVALID_USERNAME);

		// Search for users by name or username
		let result = await mongoose.models["Users"].findOne({username: req.query.username}).exec();
		if(!result) throw new NotFoundError(errorMsg.USER_NOT_FOUND);

		let partialResponse = {
			name: result.name,
			username: result.username,
			profile_picture: result.profile_picture,
		}

		res.json(partialResponse);
	} catch (err) {
		next(err);
	}
});

router.get("/api/v1/users/:id", authMiddleware, checkIdValidity("id"), async (req, res, next) => {
	try {
		// Get user by id from db
		let user = await mongoose.models["Users"].findById(req.params.id).exec();

		// If user not found return 404
		if(!user) throw new NotFoundError(errorMsg.USER_NOT_FOUND);

		let partialResponse = {
			name: user.name,
			email: user.email,
			about_me: user.about_me,
			username: user.username,
			join_date: user.join_date,
			birthday: user.birthday,
			last_time_posted: user.last_time_posted,
			profile_picture: user.profile_picture,
		}

		// If user is not authenticated, do not return email
		if(!req.isAuth || user._id.toString() !== req.user?.userId)
			delete partialResponse.email;

		res.json(partialResponse);
	} catch (err) {
		next(err);
	}
});

router.get("/api/v1/users/:id/followers", checkIdValidity("id"), async (req, res, next) => {
	try{
		let result = await mongoose.models["User_follows_user"].find({follows: req.params.id}).exec();
		if(!result) throw new NotFoundError(errorMsg.USER_NOT_FOUND);

		res.json(result);
	} catch (err) {
		next(err);
	}
});

router.get("/api/v1/users/:id/following", checkIdValidity("id"), async (req, res, next) => {
	try{
		let result = await mongoose.models["User_follows_user"].find({follower: req.params.id}).exec();
		if(!result) throw new NotFoundError(errorMsg.USER_NOT_FOUND);

		res.json(result);
	} catch (err) {
		next(err);
	}
});
//#endregion

//#region POST
router.post("/api/v1/users", async (req, res, next) => {
	try{
		let { name, email, password, username, birthday } = req.body;

		// Check if all the necessary fields are present
		if(!name || !email || !password || !username || !birthday)
			throw new ValidationError(errorMsg.REQUIRED_FIELDS);

		// Check the length and validity of fields
		if(!nameRegex.test(name)) 
			throw new ValidationError(errorMsg.INVALID_NAME);
		if(!usernameRegex.test(username))
			throw new ValidationError(errorMsg.INVALID_USERNAME);
		if(!emailRegex.test(email))
			throw new ValidationError(errorMsg.INVALID_EMAIL);
		if(!passwordRegex.test(password))
			throw new ValidationError(errorMsg.INVALID_PASSWORD);
		
		// Check if birthday is a valid date
		const birthdayCheck = new Date(birthday);
		if(isNaN(birthdayCheck.getTime()) || birthdayCheck > new Date())
			throw new ValidationError(errorMsg.INVALID_BIRTHDAY);

		// Check if user already exists by username
		let usernameExists = await mongoose.models["Users"].findOne({username}).exec();
		if(usernameExists) throw new ValidationError(errorMsg.USERNAME_EXISTS);

		// Check if user already exists by email
		let emailExists = await mongoose.models["Users"].findOne({email}).exec();
		if(emailExists) throw new ValidationError(errorMsg.EMAIL_EXISTS);

		// Remove all other fields from the request and add necessary
		req.body = {
			name, email, password, username, birthday,
			last_time_posted: null,
			about_me: "",
			profile_picture: null,
		}

		// Create new user and save to db
		let newUser = new mongoose.models["Users"](req.body);
		await newUser.save();

		// Create JWT token
		const token = jwt.sign({userId: newUser._id}, JWT_SECRET_KEY, {expiresIn: "1h"});

		// Return message, user id and token
		res.status(201).json({message: "User created", user_id: newUser._id, token: token});
	} catch (err) {
		next(err);
	}
});

router.post("/api/v1/users/following/:following_id", authMiddleware, checkIdValidity("following_id"), async (req, res, next) => {
	try{
		// Check if the user is authenticated
		if(!req.isAuth) throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		// Check if user exists by using their token
		let user = await mongoose.models["Users"].findById(req.user?.userId).exec();
		if(!user) throw new NotFoundError(errorMsg.USER_NOT_FOUND);

		// Check if following exists
		let following = await mongoose.models["Users"].findById(req.params.following_id).exec();
		if(!following) throw new NotFoundError(errorMsg.FOLLOWING_NOT_FOUND);

		// Check if user is already following
		let alreadyFollowing = await mongoose.models["User_follows_user"].findOne({follower: user._id.toString(), follows: req.params.following_id}).exec();
		if(alreadyFollowing) throw new ValidationError(errorMsg.ALREADY_FOLLOWING);

		// Create new following and save to db
		let newFollowing = new mongoose.models["User_follows_user"]({follower: user._id.toString(), follows: req.params.following_id});
		await newFollowing.save();

		res.status(201).json({message: "Following created"});
	} catch (err) {
		next(err);
	}
});
//#endregion

//#region PATCH
router.patch("/api/v1/users/:id", authMiddleware, checkIdValidity("id"), async (req, res, next) => {
	try{
		// Check if the user is authenticated
		if(!req.isAuth) throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		// Check if the user exists
		let user = await mongoose.models["Users"].findById(req.params.id).exec();
		if(!user) throw new NotFoundError(errorMsg.USER_NOT_FOUND);

		// Check if the user is the same as the authenticated user
		if(user._id.toString() !== req.user?.userId) throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		// Check if the fields are valid
		if(req.body.name && !nameRegex.test(req.body.name))
			throw new ValidationError(errorMsg.INVALID_NAME);
		if(req.body.username && !usernameRegex.test(req.body.username))
			throw new ValidationError(errorMsg.INVALID_USERNAME);
		if(req.body.email && !emailRegex.test(req.body.email))
			throw new ValidationError(errorMsg.INVALID_EMAIL);
		if(req.body.birthday && (isNaN(new Date(req.body.birthday).getTime()) || new Date(req.body.birthday) > new Date()))
			throw new ValidationError(errorMsg.INVALID_BIRTHDAY);

		// Check if the new username already exists
		if(req.body.username) {
			let usernameExists = await mongoose.models["Users"].findOne({username: req.body.username}).exec();
			if(usernameExists) throw new ValidationError(errorMsg.USERNAME_EXISTS);
		}

		// Check if the new email already exists
		if(req.body.email) {
			let emailExists = await mongoose.models["Users"].findOne({email: req.body.email}).exec();
			if(emailExists) throw new ValidationError(errorMsg.EMAIL_EXISTS);
		}

		updatableFields.forEach(field => {
			if(req.body[field]) {
				user[field] = req.body[field];
			}
		});

		await user.save();
		res.json({message: "User updated"});
	} catch (err) {
		next(err);
	}
});
//#endregion

//#region DELETE
router.delete("/api/v1/users", async (req, res, next) => { // WE DO NOT ENDORSE THIS
	try{
		// Check if the user has admin privileges
		if(req.headers["razvan_admin_privileges"] !== "awooga") throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		// Delete all users
		await mongoose.models["Users"].deleteMany({}).exec();

		res.status(200).json({message: "All users deleted"});
	} catch (err) {
		next(err);
	}
});

router.delete("/api/v1/users/:id", authMiddleware, checkIdValidity("id"), async (req, res, next) => {
	try{
		// Check if the user is authenticated
		if(!req.isAuth) throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		// Check if the user exists
		let user = await mongoose.models["Users"].findById(req.params.id).exec();
		if(!user) throw new NotFoundError(errorMsg.USER_NOT_FOUND);

		// Check if the user is the same as the authenticated user
		if(user._id.toString() !== req.user?.userId) throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		// Delete all followings
		await mongoose.models["User_follows_user"].deleteMany({$or: [{follower: req.params.id}, {follows: req.params.id}]}).exec();

		await user.deleteOne();
		res.json({message: "User deleted"});
	} catch (err) {
		next(err);
	}
});

router.delete("/api/v1/users/following/:following_id", authMiddleware, checkIdValidity("following_id"), async (req, res, next) => {
	try{
		// Check if the user is authenticated
		if(!req.isAuth) throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		// Check if the user exists
		let user = await mongoose.models["Users"].findById(req.user?.userId).exec();
		if(!user) throw new NotFoundError(errorMsg.USER_NOT_FOUND);

		// Check if following user exists
		let following = await mongoose.models["Users"].findById(req.params.following_id).exec();
		if(!following) throw new NotFoundError(errorMsg.USER_NOT_FOUND);

		// Check if user is following
		let alreadyFollowing = await mongoose.models["User_follows_user"].findOne({follower: user._id.toString(), follows: req.params.following_id}).exec();
		if(!alreadyFollowing) throw new ValidationError(errorMsg.FOLLOWING_NOT_FOUND);

		await alreadyFollowing.deleteOne();
		res.json({message: "Following deleted"});
	} catch (err) {
		next(err);
	}
});
//#endregion


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