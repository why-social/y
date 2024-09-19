const express = require("express");
const router = express.Router();
var path = require('path');
var fs = require('fs')
const mongoose = require("../db/database").mongoose;
const authMiddleware = require('../middleware/auth');

//#region GET
// Get image from the server
router.get("/api/v1/images/:hash", async function(req, res) {
    const options = {
        root: appRoot
    };

    const imageObject = await mongoose.models["Images"].findOne({hash : req.params.hash}, 'url').exec();
    if (!imageObject) {
        // invalid hash supplied
        res.status(404).json({ 'message': 'Not Found' });
        return;
    }

    const url = imageObject.url;

    res.sendFile(url, options, function(err) {
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
        res.status(400).json({'message' : 'Image still in use!'});
        return;
    }

    
    console.log("Deleting " + path.join(__dirname, imageObject.url));

    fs.rmSync(path.join(appRoot, "/uploads/" + imageObject.hash), { recursive: true, force: true }); // delete the directory
    await mongoose.models["Images"].deleteOne({_id : imageObject._id}).exec(); // delete the DB entry

    res.status(200).send();
});
//#endregion

module.exports = router;