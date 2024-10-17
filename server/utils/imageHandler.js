const fs = require('fs');
var path = require('path');
const crypto = require('crypto');
var models = require('../db/database').mongoose.models;
const { except, removeFromArray } = require("./utils");

const uploadDir = process.env.UPLOAD_DIR || '/uploads/';

/**
 * Adds images to the given post and updates the file usage in the DB.
 * @param images Images list to update.
 * @param req Request containing inserted files
 * @param deleted List of deleted hashes
 */
async function updateImages(images, req, deleted) {
    const files = req.files || [];

    for (const file of files) {
        const hash = await saveFile(req, file); // save the file to disk and create DB entry if needed

        await addUsage(hash);
        images.push(hash);
    }

    if (Array.isArray(deleted)) {
        for (const hash of deleted) {
            await removeUsage(hash);
            removeFromArray(images, hash);
        }
    } else if (deleted?.length) {
        await removeUsage(deleted);
        removeFromArray(images, deleted);
    }
}

async function changeImage(image, req) {
    if (image)
        removeUsage(image);
    const hash = await saveFile(req, req.file);
    if (hash == image)
        return hash;

    await addUsage(hash);
    return hash;
}

async function addUsage(hash) {
    return await models.Images.findOneAndUpdate({ hash: hash }, { $inc: { usageCount: 1 } }, { new: true });
}

async function removeUsage(hash) {
    const image = await models.Images.findOneAndUpdate({ hash: hash }, { $inc: { usageCount: -1 } }, { new: true });
    if (image && image?.usageCount <= 0) {
        fs.rmSync(path.join(appRoot, uploadDir + image.hash), { recursive: true, force: true }); // delete the directory
        await image.deleteOne().exec(); // delete the DB entry
    }
}

async function saveFile(req, file) {
    // Saves the file from multer buffer (memory) to disk and updates images DB
    const fileBuffer = file.buffer; // read file from multer buffer
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex'); // generate hash from the file content
    const dir = path.join(appRoot, uploadDir, hash)
    const relPath = path.join(uploadDir, hash, file.originalname);
    const filePath = path.join(dir, file.originalname);
    const url = `${req.protocol}://${req.get('host')}${relPath.replace(/\\/g, '/')}`;

    // check if the directory (image) already exists
    if (fs.existsSync(dir)) {
        const image = await models.Images.findOne({ hash });
        if (!image) { // db and fs desync happened (directory exists but no db entry), force re-write file
            fs.rmSync(dir, { recursive: true, force: true }); // delete the directory
        }
        else return image.hash; // only update the existing document in the DB
    }

    // save the file with its original name inside the /hash directory
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, fileBuffer);

    var imageEntry = await new models.Images({ hash: hash, url: url, usageCount: 0 });
    await imageEntry.save();
    return imageEntry.hash; // insert new entry into Images collection
}

module.exports = { updateImages, changeImage, removeUsage }