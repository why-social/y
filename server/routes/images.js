const express = require("express");
const router = express.Router();
var path = require('path');
var fs = require('fs')
const mongoose = require("../db/database").mongoose;
const authMiddleware = require('../middleware/auth');
const { NotFoundError, UnauthorizedError, ConflictError, errorMsg } = require("../utils/errors");
const uploadDir = process.env.UPLOAD_DIR || '/uploads/';

//#region GET
// Get image from the server
router.get("/api/v1/images", async function(req, res, next) {
	try{
		// Get all images hashes
		let images = await mongoose.models["Images"].find({}, 'hash').exec();
		images = images.map(image => image.hash);
		
		res.status(200).json(images);
	} catch(err) {
		next(err);
	}
});

router.get("/api/v1/images/:hash", async function(req, res, next) {
	try{
		const imageObject = await mongoose.models["Images"].findOne({hash : req.params.hash}, 'url').lean().exec();
		if (!imageObject) throw new NotFoundError(errorMsg.IMAGE_NOT_FOUND);

		res.status(200).json(imageObject.url);
	} catch(err) {
		next(err);
	}
});
//#endregion

//#region DELETE
// Delete an image
router.delete("/api/v1/images/:hash", authMiddleware, async function(req, res, next) {
	try{
		const imageObject = await mongoose.models["Images"].findOne({hash : req.params.hash}).exec();
		if (!imageObject) // invalid hash supplied / not in DB
			throw new NotFoundError(errorMsg.IMAGE_NOT_FOUND);

		if (imageObject.usageCount != 0)
			throw new ConflictError(errorMsg.IMG_IN_USE);
		
		console.log("Deleting " + path.join(__dirname, imageObject.url));

		fs.rmSync(path.join(appRoot, uploadDir, imageObject.hash), { recursive: true, force: true }); // delete the directory
		await mongoose.models["Images"].deleteOne({_id : imageObject._id}).exec(); // delete the DB entry

		res.status(200).send();
	} catch(err) {
		next(err);
	}
});

router.delete("/api/v1/images", authMiddleware, async function(req, res, next) {
	try{
		// Check if the user has admin privileges
		if (!req.isAuth || !req.user || !req.isAdmin)
			throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		// Delete all images
		await mongoose.models["Images"].deleteMany({}).exec();

		// Delete all files in the uploads directory
		const uploadsPath = path.join(appRoot, uploadDir);
		fs.readdirSync(uploadsPath).forEach(file => {
			const filePath = path.join(uploadsPath, file);
			fs.rmSync(filePath, { recursive: true, force: true });
		});

		res.status(200).send({message: "All images deleted"});
	} catch(err) {
		next(err);
	}
});
//#endregion

module.exports = router;