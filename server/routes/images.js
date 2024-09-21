const express = require("express");
const router = express.Router();
var path = require('path');
var fs = require('fs')
const mongoose = require("../db/database").mongoose;
const authMiddleware = require('../middleware/auth');

//#region GET
// Get image from the server
router.get("/api/v1/images", async function(req, res) {
	
	// Get all images hashes
	let images = await mongoose.models["Images"].find({}, 'hash').exec();
	images = images.map(image => image.hash);
	
	res.status(200).json(images);
});

router.get("/api/v1/images/:hash", async function(req, res) {
    const imageObject = await mongoose.models["Images"].findOne({hash : req.params.hash}, 'url').lean().exec();
    if (!imageObject) {
        // invalid hash supplied
        res.status(404).json({ 'message': 'Not Found' });
        return;
    }

    const url = imageObject.url;

    res.status(200).sendFile(url, function(err) {
        if (err) {
            // hash directory exists, but is empty
            // TODO: check if files present in directory, delete if empty or try fixing DB/file
            res.status(404).json(err);
            console.error('Error sending file:', err);
        } else {
            console.log('Sent:', url);
        }
    });
});
//#endregion

//#region DELETE
// Delete an image
router.delete("/api/v1/images/:hash", authMiddleware, async function(req, res) {
    // TODO: require authorization
    const imageObject = await mongoose.models["Images"].findOne({hash : req.params.hash}).exec();
    if (!imageObject) {
        // invalid hash supplied / not in DB
        res.status(404).json({ 'message': 'Not Found' });
        return;
    }

    if (imageObject.usageCount != 0) {
        res.status(409).json({'message' : 'Image still in use!'});
        return;
    }

    
    console.log("Deleting " + path.join(__dirname, imageObject.url));

    fs.rmSync(path.join(appRoot, "/uploads/" + imageObject.hash), { recursive: true, force: true }); // delete the directory
    await mongoose.models["Images"].deleteOne({_id : imageObject._id}).exec(); // delete the DB entry

    res.status(200).send();
});

router.delete("/api/v1/images", async function(req, res) {
	// Check if the user has admin privileges
	if(req.headers["razvan_admin_privileges"] !== "awooga") 
		res.status(401).json({message: "Unauthorized"});

	// Delete all images
	await mongoose.models["Images"].deleteMany({}).exec();

	// Delete all files in the uploads directory
	const uploadsPath = path.join(appRoot, "/uploads");
	fs.readdirSync(uploadsPath).forEach(file => {
		const filePath = path.join(uploadsPath, file);
		fs.rmSync(filePath, { recursive: true, force: true });
	});

	res.status(200).send({message: "All images deleted"});
});
//#endregion

module.exports = router;