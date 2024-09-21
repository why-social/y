const models = require("../db/database").mongoose.models;
const { NotFoundError, errorMsg } = require("../utils/errors");

// Helper function to return the difference between two arrays
function except(array, excludes) { // https://stackoverflow.com/a/68575761
    return array.filter((item) => !excludes.includes(item));
}

async function getCommentById(id, lean, next) {
	try{
		let result;
		if (lean)
			result = await models.Comments.findById(id).lean().exec();
		else
			result = await models.Comments.findById(id).exec();
		
		if (!result)
			throw new NotFoundError(errorMsg.COMMENT_NOT_FOUND);
		
		return result;
	} catch (err) {
		next(err);
	}
}

module.exports = { except, getCommentById };