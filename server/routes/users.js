const express = require("express");
const router = express.Router();
const mongoose = require("../db/database").mongoose;
const authMiddleware = require("../middleware/auth");
const { ValidationError, UnauthorizedError, NotFoundError, ConflictError, errorMsg } = require("../utils/errors");
const { nameRegex, usernameRegex, emailRegex, passwordRegex } = require("../utils/customRegex");
const { createUserToken } = require("../utils/utils");
const uploadMiddleware = require("../middleware/upload");
const imageHandler = require("../utils/imageHandler");

/**
* Fields that can be updated
*/
const updatableFields = ['name', 'email', 'username', 'birthday', 'about_me', 'profile_picture'];

//#region GET
router.get("/api/v1/users/search", async (req, res, next) => {
	try{
		// Check if the search query is present
		if(!req.query.query) throw new ValidationError(errorMsg.REQUIRED_FIELDS);

		let searchQuery = [];
		
		const target = req.query.query;
		// Check username validity
		if(usernameRegex.test(target)) // if the query can be a username
			searchQuery.push({username: {$regex: new RegExp(target, 'i')}});
		if(nameRegex.test(target)) // if the query can be a name
			searchQuery.push({name: {$regex: new RegExp(target, 'i')}});
		
		// Search for users by name or username
		let result = (await mongoose.models["Users"].find({$or: searchQuery}).limit(7).populate('profile_picture_url'))
			.map(entry => {return entry.username});
		if(!result) throw new NotFoundError(errorMsg.USER_NOT_FOUND);

		res.status(200).json(result);
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

router.get("/api/v1/users/:username", authMiddleware, async (req, res, next) => {
	try {
		// Get user by username from db
		let user = await mongoose.models["Users"].findOne({ username: req.params.username }).populate('profile_picture_url');
		
		// If user not found return 404
		if(!user) throw new NotFoundError(errorMsg.USER_NOT_FOUND);
		
		let partialResponse = {
			_id: user._id,
			name: user.name,
			email: user.email,
			about_me: user.about_me,
			username: user.username,
			join_date: user.join_date,
			birthday: user.birthday,
			last_time_posted: user.last_time_posted,
			profile_picture_url: user.profile_picture_url
		}
		
		// If user is not authenticated, do not return email
		if(!req.isAuth || user._id.toString() !== req.user?.userId)
			delete partialResponse.email;
		
		res.status(200).json(partialResponse);
	} catch (err) {
		next(err);
	}
});

router.get("/api/v1/users/:username/suggestions", authMiddleware, async (req, res, next) => {
	try {
		const user = await mongoose.models["Users"].findOne({ username: req.params.username });
		if (!user)
			throw new NotFoundError(errorMsg.USER_NOT_FOUND);

		if(!req.isAuth || req.user?.userId != user._id) throw new UnauthorizedError(errorMsg.UNAUTHORIZED);
		
		let userFollowsIds = [];
		let userFollowsUsernames = [];
		(await mongoose.models.User_follows_user.find({ follower: user._id}, 'follows -_id').populate('follows', 'username'))
			.forEach(entry => {
				userFollowsIds.push(entry.follows._id.toString());
				userFollowsUsernames.push(entry.follows.username);
			});

		const secondHand = (await mongoose.models.User_follows_user.find({ follower: {$in : userFollowsIds}}, 'follows').populate('follows', 'username'))
			.map(entry => {return entry.follows.username})
			.filter(username => {return !userFollowsUsernames.includes(username) && username != user.username})
			.sort(() => 0.5 - Math.random()) // shuffle array
			.slice(0, 5); // limit results
		
		let result = [];
		if (secondHand.length) result = secondHand;
		else { // if no second-hand suggestions found
			const userCount = await mongoose.models["Users"].countDocuments({});
			for (let i = 0; i < Math.min(5, userCount); i++) { // pick random users to suggest
				const random = Math.floor(Math.random() * userCount);
				const randomUser = await mongoose.models["Users"].findOne().skip(random).select('username');
				if (user.username != randomUser.username) result.push(randomUser.username);
			}
		}
			
		return res.json(result);
	} catch (err) {
		next(err);
	}
});

router.get("/api/v1/users/:id/profile_picture", async (req, res, next) => {
	try {
		// Get user by id from db
		let user = await mongoose.models["Users"].findById(req.params.id).populate('profile_picture_url').exec();
		
		// If user not found return 404
		if(!user) throw new NotFoundError(errorMsg.USER_NOT_FOUND);
		
		res.status(200).json(user.profile_picture_url);
	} catch (err) {
		next(err);
	}
});

router.get("/api/v1/users/:username/followers", async (req, res, next) => {
	try{
		// Check if the user exists
		let user = await mongoose.models["Users"].findOne({ username: req.params.username }).exec();
		if(!user) throw new NotFoundError(errorMsg.USER_NOT_FOUND);
		
		// Get all users that follow the user
		let result = (await mongoose.models["User_follows_user"].find({follows: user._id}).populate('follower', 'username -_id'))
			.map(entry => {return entry.follower.username});
		
		res.status(200).json(result);
	} catch (err) {
		next(err);
	}
});

router.get("/api/v1/users/:username/followings", async (req, res, next) => {
	try{
		// Check if the user exists
		let user = await mongoose.models["Users"].findOne({ username: req.params.username }).exec();
		if(!user) throw new NotFoundError(errorMsg.USER_NOT_FOUND);
		
		// Get all users that the user follows
		let result = (await mongoose.models["User_follows_user"].find({follower: user._id}, 'follows -_id').populate('follows', 'username -_id'))
			.map(entry => {return entry.follows.username});
		
		res.status(200).json(result);
	} catch (err) {
		next(err);
	}
});

// Get all posts of a user
// Returns all posts authored by the user with id :id
router.get("/api/v1/users/:username/posts", async function (req, res, next) {
	try {
		const user = await mongoose.models["Users"].findOne({ username: req.params.username }).exec();
		if (!user)
			throw new NotFoundError(errorMsg.USER_NOT_FOUND);
		
		const posts = await mongoose.models["Posts"].find({
			author: user._id,
			$or: [
				{ is_deleted: { $exists: false } },
				{ is_deleted: false }
			]
			})
			.populate({
				path: 'author', select: '_id name username profile_picture',
				populate: {
					path: 'profile_picture_url'
				}
			})
			.populate({
				path: 'original_post', select: 'author',
				populate: {
					path: 'author', select: '_id name username profile_picture',
					populate: {
						path: 'profile_picture_url'
					}
				}
			})
			.populate({
				path: 'image_urls'
			})
			.sort({timestamp: -1});
		
		if (!posts || posts.length == 0)
			throw new NotFoundError(errorMsg.POST_NOT_FOUND);	
		
		res.status(200).json(posts);
	} catch (err) {
		next(err);
	}
});

// Get all comments of a user
router.get("/api/v1/users/:username/comments", async function (req, res, next) {
	try {
		const user = await mongoose.models["Users"].findOne({ username: req.params.username }).exec();
		if (!user)
			throw new NotFoundError(errorMsg.USER_NOT_FOUND);
		
		let result = await mongoose.models["Comments"].find({
			author: user._id,
			$or: [
				{ is_deleted: { $exists: false } },
				{ is_deleted: false }
			]})
			.populate({
				path: 'author', select: '_id name username profile_picture',
				populate: {
					path: 'profile_picture_url'
				}
			})
			.populate({
				path: 'image_urls'
			})
			.sort({timestamp: -1});
		
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
		const token = createUserToken(newUser);
		
		// Return message, user id and token
		res.status(201).json({message: "User created", user_id: newUser._id, token: token});
	} catch (err) {
		next(err);
	}
});

router.post("/api/v1/users/followings/:target_username", authMiddleware, async (req, res, next) => {
	try{
		// Check if the user is authenticated
		if(!req.isAuth || !req.user) throw new UnauthorizedError(errorMsg.UNAUTHORIZED);
		
		// Check if user exists by using their token
		const user = await mongoose.models["Users"].findById(req.user?.userId).lean();
		if(!user) throw new NotFoundError(errorMsg.USER_NOT_FOUND);
		
		// Get the target user
		const target = await mongoose.models["Users"].findOne({ username: req.params.target_username});
		if(!target) throw new NotFoundError(errorMsg.USER_NOT_FOUND);
		
		// Check if user tries to follow themselves
		if(user.username === req.params.target_username) throw new ValidationError(errorMsg.CANNOT_FOLLOW_YOURSELF);
		
		// Check if user is already following
		let alreadyFollowing = await mongoose.models["User_follows_user"].findOne({follower: user._id.toString(), follows: target._id.toString()}).exec();
		if(alreadyFollowing) throw new ConflictError(errorMsg.ALREADY_FOLLOWING);
		
		// Create new following and save to db
		let newFollowing = new mongoose.models["User_follows_user"]({follower: user._id.toString(), follows: target._id.toString()});
		await newFollowing.save();
		
		res.status(201).json({message: "Following created"});
	} catch (err) {
		next(err);
	}
});
//#endregion

//#region PUT
router.put("/api/v1/users/:id/profile_picture", authMiddleware, uploadMiddleware.single, async (req, res, next) => {
	try {
		// Check if the user is authenticated
		if(!req.isAuth || req.user?.userId != req.params.id) throw new UnauthorizedError(errorMsg.UNAUTHORIZED);
		
		// Check if user exists by using their token
		let user = await mongoose.models["Users"].findById(req.user?.userId).exec();
		if(!user) throw new NotFoundError(errorMsg.USER_NOT_FOUND);
		
		if(!req.file) throw new ValidationError("No image to upload");
		
		user.profile_picture = await imageHandler.changeImage(user.profile_picture, req);
		await user.save();
		
        user = await mongoose.models["Users"].findById(req.user?.userId).populate('profile_picture_url'); // re-fetch for updated pfp
		return res.status(201).json({id: user._id, pfp: user.profile_picture_url});
	} catch (err) {
		next(err);
	}
});

router.put('/api/v1/users/:id', authMiddleware, async (req, res, next) => {
  try{
    if(!req.isAuth || !req.user)
      throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

    // Check if the user exists
		let user = await mongoose.models["Users"].findById(req.user.userId).exec();
		if(!user) throw new NotFoundError(errorMsg.USER_NOT_FOUND);

    // Check if the user is the same as the authenticated user
    if(req.user.userId !== req.params.id)
      throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

    // Check if the fields are present
    if(!req.body || !req.body.name || !req.body.email || !req.body.birthday || !req.body.password || !('about_me' in req.body))
      throw new ValidationError(errorMsg.REQUIRED_FIELDS);

    const newFields = req.body;

    // Check if the fields are valid
    if(!nameRegex.test(newFields.name))
      throw new ValidationError(errorMsg.INVALID_NAME);

    if(!emailRegex.test(newFields.email))
      throw new ValidationError(errorMsg.INVALID_EMAIL);

    if(isNaN(new Date(newFields.birthday).getTime()) || new Date(newFields.birthday) > new Date())
      throw new ValidationError(errorMsg.INVALID_BIRTHDAY);

    if(!passwordRegex.test(newFields.password))
      throw new ValidationError(errorMsg.INVALID_PASSWORD);

    user.name = newFields.name;
    user.email = newFields.email;
    user.birthday = newFields.birthday;
    user.password = newFields.password;
    user.about_me = newFields.about_me;

    await user.save();

    res.status(200).json({message: "User updated"});
  }catch(err){
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
			if (req.body[field] !== undefined && req.body[field] !== null) {
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
router.delete("/api/v1/users", authMiddleware, async (req, res, next) => { // WE DO NOT ENDORSE THIS
	try{
		// Check if the user has admin privileges
		if (!req.isAuth || !req.user || !req.isAdmin)
			throw new UnauthorizedError(errorMsg.UNAUTHORIZED);
		
		// Delete all users
		await mongoose.models["Users"].deleteMany({username: {$ne: 'Admin'}});
		await mongoose.models["User_follows_user"].deleteMany({});
		
		res.status(200).json({message: "All users deleted"});
	} catch (err) {
		next(err);
	}
});

router.delete("/api/v1/users/:id/profile_picture", authMiddleware, async (req, res, next) => {
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