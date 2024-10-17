const jwt = require("jsonwebtoken");

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

function createUserToken(user) {
	return jwt.sign({
		userId: user._id,
		username: user.username,
		adminKey: (user.username === 'Admin') ? process.env.ADMIN_KEY : undefined
	},
		secrets.JWT_SECRET_KEY, { expiresIn: "1h" }
	);
}

async function getCommentById(id, next) {
	try {
		let query = models.Comments.findById(id)
			.populate([
				{
					path: 'author', select: '_id name username profile_picture',
					populate: {
						path: 'profile_picture_url'
					}
				},
				{
					path: 'comments',
					populate: [
						{
							path: 'author',
							select: '_id name username profile_picture',
							populate: {
								path: 'profile_picture_url'
							}	
						},
						{
							path: 'image_urls'
						}
					]
				},
				{
					path: 'image_urls'
				}
			]);

		const result = await query.exec();

		if (!result)
			throw new NotFoundError(errorMsg.COMMENT_NOT_FOUND);

		return result;
	} catch (err) {
		next(err);
	}
}

module.exports = { except, removeFromArray, createUserToken, getCommentById, secrets };