const express = require("express");
const router = express.Router();
const mongoose = require("../db/database").mongoose;
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth");
const { ValidationError, UnauthorizedError, NotFoundError, ConflictError, errorMsg } = require("../utils/errors");
const { nameRegex, usernameRegex, emailRegex, passwordRegex } = require("../utils/customRegex");
const { secrets, getPublicPathFromHash } = require("../utils/utils");
const uploadMiddleware = require("../middleware/upload");
const imageHandler = require("../utils/imageHandler");

const JWT_SECRET_KEY = secrets.JWT_SECRET_KEY;

/**
 * Fields that can be updated
 */
const updatableFields = ['name', 'email', 'username', 'birthday', 'about_me', 'profile_picture'];

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
      _id: result._id,
			profile_picture: await getPublicPathFromHash(req, result.profile_picture),
		}

		res.status(200).json(partialResponse);
	} catch (err) {
		next(err);
	}
});

router.get("/api/v1/users", authMiddleware, async (req, res, next) => {
	try {
		let allUsers = await mongoose.models["Users"].find().exec();

		// return all usernames
		let usernames = allUsers.map(user => user.username);

		res.status(200).json(usernames);
	} catch (err) {
		next(err);
	}
});

router.get("/api/v1/users/:id", authMiddleware, async (req, res, next) => {
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
			profile_picture: await getPublicPathFromHash(req, user.profile_picture),
		}

		// If user is not authenticated, do not return email
		if(!req.isAuth || user._id.toString() !== req.user?.userId)
			delete partialResponse.email;

		res.status(200).json(partialResponse);
	} catch (err) {
		next(err);
	}
});

router.get("/api/v1/users/:id/profile_picture", async (req, res, next) => {
	try {
		// Get user by id from db
		let user = await mongoose.models["Users"].findById(req.params.id).lean().exec();

		// If user not found return 404
		if(!user) throw new NotFoundError(errorMsg.USER_NOT_FOUND);

		let result = user.profile_picture ? await getPublicPathFromHash(req, user.profile_picture) : null;
		console.log(result);
		res.status(200).json(result);
	} catch (err) {
		next(err);
	}
});

router.get("/api/v1/users/:id/followers", async (req, res, next) => {
	try{
		// Check if the user exists
		let user = await mongoose.models["Users"].findById(req.params.id).exec();
		if(!user) throw new NotFoundError(errorMsg.USER_NOT_FOUND);

		// Get all users that follow the user
		let result = await mongoose.models["User_follows_user"].find({follows: req.params.id}).exec();

		res.status(200).json(result);
	} catch (err) {
		next(err);
	}
});

router.get("/api/v1/users/:id/followings", async (req, res, next) => {
	try{
		// Check if the user exists
		let user = await mongoose.models["Users"].findById(req.params.id).exec();
		if(!user) throw new NotFoundError(errorMsg.USER_NOT_FOUND);

		// Get all users that the user follows
		let result = await mongoose.models["User_follows_user"].find({follower: req.params.id}).exec();

		res.status(200).json(result);
	} catch (err) {
		next(err);
	}
});

// Get all posts of a user
// Returns all posts authored by the user with id :id
router.get("/api/v1/users/:id/posts", async function (req, res, next) {
	try {
		const posts = await mongoose.models["Posts"].find({ author: req.params.id }).populate({
			path: 'author', select: '_id name username profile_picture',
		}).lean().exec();

		if (!posts || posts.length == 0)
			throw new NotFoundError(errorMsg.POST_NOT_FOUND);

		if (posts[0].author.profile_picture) {
			posts[0].author.profile_picture = await getPublicPathFromHash(req, posts[0].author.profile_picture);
		} // changes the author pfp in all the posts, since they are reference-shared

		for (var post of posts) {
			post.images = await Promise.all(
				post.images.map(async image => {
					return await getPublicPathFromHash(req, image);
				})
			);
		}	

		res.status(200).json(posts);
	} catch (err) {
		next(err);
	}
});

// Get all comments of a user
router.get("/api/v1/users/:id/comments", async function (req, res, next) {
	try {
		let userExists = await mongoose.models["Users"].exists({ _id: req.params.id });
		if(!userExists) throw new NotFoundError(errorMsg.USER_NOT_FOUND);
		
		let result = await mongoose.models["Comments"]
			.find({ author: req.params.id })
			.populate({
				path: 'author', select: '_id name username profile_picture',
			})
			.lean().exec();
		
		if (result[0]?.author.profile_picture) {
			result[0].author.profile_picture = await getPublicPathFromHash(req, result[0].author.profile_picture);
		} // changes the author pfp in all the comments, since they are reference-shared

		for (var comment of result) {
			comment.images = await Promise.all(
				comment.images.map(async image => {
					return await getPublicPathFromHash(req, image);
				})
			);
		}
		
		return res.status(200).json(result);
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
		if(usernameExists) throw new ConflictError(errorMsg.USERNAME_EXISTS);

		// Check if user already exists by email
		let emailExists = await mongoose.models["Users"].findOne({email}).exec();
		if(emailExists) throw new ConflictError(errorMsg.EMAIL_EXISTS);
		
		// TODO: hash the password

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

router.post("/api/v1/users/:id/images", authMiddleware, uploadMiddleware.single, async (req, res, next) => {
	try {
		// Check if the user is authenticated
		if(!req.isAuth || req.user?.userId != req.params.id) throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		// Check if user exists by using their token
		let user = await mongoose.models["Users"].findById(req.user?.userId).exec();
		if(!user) throw new NotFoundError(errorMsg.USER_NOT_FOUND);

		if(!req.file) throw new ValidationError("No image to upload");

		user.profile_picture = await imageHandler.changeImage(user.profile_picture, req.file);
		await user.save();

		return res.status(201).json({id: user._id, pfp: user.profile_picture});
	} catch (err) {
		next(err);
	}
});

router.post("/api/v1/users/followings/:following_id", authMiddleware, async (req, res, next) => {
	try{
		// Check if the user is authenticated
		if(!req.isAuth) throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		// Check if user exists by using their token
		let user = await mongoose.models["Users"].findById(req.user?.userId).exec();
		if(!user) throw new NotFoundError(errorMsg.USER_NOT_FOUND);

		// Check if following exists
		let following = await mongoose.models["Users"].findById(req.params.following_id).exec();
		if(!following) throw new NotFoundError(errorMsg.FOLLOWING_NOT_FOUND);

		// Check if user tries to follow themselves
		if(user._id.toString() === req.params.following_id) throw new ValidationError(errorMsg.CANNOT_FOLLOW_YOURSELF);

		// Check if user is already following
		let alreadyFollowing = await mongoose.models["User_follows_user"].findOne({follower: user._id.toString(), follows: req.params.following_id}).exec();
		if(alreadyFollowing) throw new ConflictError(errorMsg.ALREADY_FOLLOWING);

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
router.patch("/api/v1/users/:id", authMiddleware, async (req, res, next) => {
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
			if(usernameExists) throw new ConflictError(errorMsg.USERNAME_EXISTS);
		}

		// Check if the new email already exists
		if(req.body.email) {
			let emailExists = await mongoose.models["Users"].findOne({email: req.body.email}).exec();
			if(emailExists) throw new ConflictError(errorMsg.EMAIL_EXISTS);
		}

		updatableFields.forEach(field => {
			if(req.body[field]) {
				user[field] = req.body[field];
			}
		});

		await user.save();
		res.status(200).json({message: "User updated"});
	} catch (err) {
		next(err);
	}
});
//#endregion

//#region DELETE
router.delete("/api/v1/users", async (req, res, next) => { // WE DO NOT ENDORSE THIS
	try{
		// Check if the user has admin privileges
		if(!req.headers["authorization"] || req.headers["authorization"] !== process.env.ADMIN_KEY)
			throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		// Delete all users
		await mongoose.models["Users"].deleteMany({}).exec();

		res.status(200).json({message: "All users deleted"});
	} catch (err) {
		next(err);
	}
});

router.delete("/api/v1/users/:id/images", authMiddleware, async (req, res, next) => {
	try {
		// Check if the user is authenticated
		if(!req.isAuth || req.user?.userId != req.params.id) throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		// Check if user exists by using their token
		let user = await mongoose.models["Users"].findById(req.user?.userId).exec();
		if(!user) throw new NotFoundError(errorMsg.USER_NOT_FOUND);

		await imageHandler.removeUsage(user.profile_picture);
		user.profile_picture = null;
		await user.save();

		return res.status(200).json({message: 'Deleted'});
	} catch (err) {
		next(err);
	}
});

router.delete("/api/v1/users/:id", authMiddleware, async (req, res, next) => {
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
		res.status(200).json({message: "User deleted"});
	} catch (err) {
		next(err);
	}
});

router.delete("/api/v1/users/followings/:following_id", authMiddleware, async (req, res, next) => {
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
		res.status(200).json({message: "Following deleted"});
	} catch (err) {
		next(err);
	}
});
//#endregion


module.exports = router;