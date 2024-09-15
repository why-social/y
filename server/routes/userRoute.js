const express = require("express");
const router = express.Router();
const mongoose = require("../db/createDB").mongoose;
const authMiddleware = require("../middleware/auth");

//#region GET
router.get("/api/user/:id", authMiddleware, async (req, res) => {
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

router.get("/api/user/:id/followers", async (req,res) => {
	try{
		let result = await mongoose.models["User_follows_user"].find({follows: req.params.id}).exec();
		if(!result) return res.status(404).json({message: "User not found"});
		res.json(result);
	} catch (err) {
		res.status(500).json({message: "Server error"});
	}
});

router.get("/api/user/:id/following", async (req,res) => {
	try{
		let result = await mongoose.models["User_follows_user"].find({follower: req.params.id}).exec();
		if(!result) return res.status(404).json({message: "User not found"});
		res.json(result);
	} catch (err) {
		res.status(500).json({message: "Server error"});
	}
});
//#endregion


module.exports = router;