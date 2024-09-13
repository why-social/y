const express = require("express");
const router = express.Router();
const mongoose = require("../db/createDB").mongoose;

//#region GET
router.get("/user/:id", (req,res) => {

	//TODO: Replace with actual user page

	res.send(`<html><body>User id: ${req.params.id}</body></html>`);
});

router.get("/api/user/:id", async (req,res) => {

	//TODO: Add special case for authenticated users

	let result = await mongoose.models["Users"].findById(req.params.id).exec();
	res.json(result);
});

router.get("/api/user/:id/followers", async (req,res) => {
	let result = await mongoose.models["User_follows_user"].find({follows: req.params.id}).exec();
	res.json(result);
});

router.get("/api/user/:id/following", async (req,res) => {
	let result = await mongoose.models["User_follows_user"].find({follower: req.params.id}).exec();
	res.json(result);
});
//#endregion


module.exports = router;