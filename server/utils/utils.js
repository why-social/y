const models = require("../db/database").mongoose.models;
const { NotFoundError, errorMsg } = require("../utils/errors");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "TEST SECRET KEY SHOULD BE CHANGED BEFORE PRODUCTION";
const MJ_APIKEY_PUBLIC = process.env.MJ_APIKEY_PUBLIC;
const MJ_APIKEY_PRIVATE = process.env.MJ_APIKEY_PRIVATE;

const secrets = { JWT_SECRET_KEY, MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE };

// Helper function to return the difference between two arrays
function except(array, excludes) { // Adapted from https://stackoverflow.com/a/68575761
	if (array == null) return excludes;
	if (excludes == null) return array;
    return array.filter((item) => !excludes.includes(item));
}

function removeFromArray(array, item) {
	const index = array.indexOf(item);
    if (index == -1)
		throw new NotFoundError('Item not in array');
	array.splice(index, 1);
}

async function getCommentById(id, lean, next) {
	try{
		let result;
		if (lean)
			result = await models.Comments.findById(id)
			.populate({
				path: 'author', select: '_id name username profile_picture',
			}).populate('comments').lean().exec();
		else
			result = await models.Comments.findById(id)
			.populate({
				path: 'author', select: '_id name username profile_picture',
			}).populate('comments').exec();
		
		if (!result)
			throw new NotFoundError(errorMsg.COMMENT_NOT_FOUND);
		
		return result;
	} catch (err) {
		next(err);
	}
}

async function getPublicPathFromHash(req, hash) {
	const image = await models.Images.findOne({hash}).lean();
	if (!image) return null;

	return toPublicPath(req, image.url);
}

function toPublicPath(req, path) {
	if(path.startsWith("http")) {
		return path; // already is public path
	}

	return `${req.protocol}://${req.get('host')}${path?.replace(/\\/g, '/')}`
}

module.exports = { except, removeFromArray, getCommentById, toPublicPath, getPublicPathFromHash, secrets };