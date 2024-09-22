const fs = require('fs');
var path = require('path');
const crypto = require('crypto');
var models = require('../db/database').mongoose.models;
const { except, removeFromArray } = require("./utils");

/**
 * Adds images to the given post and updates the file usage in the DB.
 * @param item Post/comment to update. Must have an 'images' field!
 * @param files List of new files
 * @returns Array of hashes in use after update
 */
async function updateImages(item, files) {
    const prevHashes = item.images || [];
    var newHashes = [];

    for (const file of files) {        
        const hash = await saveFile(file); // save the file to disk and create DB entry if needed
        newHashes.push(hash);
    }

    const toAdd = except(newHashes, prevHashes);
    const toRemove = except(prevHashes, newHashes);

    toAdd.forEach(hash => {
        addUsage(hash);
        item.images.push(hash);
    });

    toRemove.forEach(hash => {
        removeUsage(hash);
        removeFromArray(item.images, hash);
    });
}

async function addUsage(hash) {
    return await models.Images.findOneAndUpdate({hash : hash}, {$inc: {usageCount: 1}}, {new: true});
}

async function removeUsage(hash) {
    const image = await models.Images.findOneAndUpdate({hash : hash}, {$inc: {usageCount: -1}}, {new: true});
    if (image.usageCount <= 0) {
        fs.rmSync(path.join(appRoot, "/uploads/" + image.hash), { recursive: true, force: true }); // delete the directory
        await image.deleteOne().exec(); // delete the DB entry
    }
}

async function saveFile(file) {
    // Saves the file from multer buffer (memory) to disk and updates images DB
    const fileBuffer = file.buffer; // read file from multer buffer
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex'); // generate hash from the file content
    const dir = path.join(appRoot, '/uploads/', hash);
    const filePath = path.join(dir, file.originalname);
    
    // check if the directory (image) already exists
    if (fs.existsSync(dir)) {
        const image = await models.Images.findOne({hash});
        return image.hash; // only update the existing document in the DB
    }
    
    // save the file with its original name inside the /hash directory
    fs.mkdirSync(dir, { recursive: true });         
    fs.writeFileSync(filePath, fileBuffer);

    var imageEntry = await new models.Images({hash: hash, url: filePath, usageCount: 0});
    await imageEntry.save();
    return imageEntry.hash; // insert new entry into Images collection
}

module.exports = {updateImages, addUsage, removeUsage}