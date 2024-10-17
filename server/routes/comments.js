const express = require("express");
const router = express.Router();
const models = require("../db/database").mongoose.models;
const authMiddleware = require("../middleware/auth");
const { NotFoundError, UnauthorizedError, ValidationError, errorMsg } = require("../utils/errors");
const { getCommentById } = require("../utils/utils");
const { updateImages, removeUsage } = require("../utils/imageHandler");
const uploadMiddleware = require("../middleware/upload");

//#region GET
router.get("/api/v1/comments/:id", authMiddleware, async function (req, res, next) {
	try {
		let comment = await getCommentById(req.params.id, next);

		if (!comment) throw new NotFoundError(errorMsg.COMMENT_NOT_FOUND);

		comment = comment.toJSON();
		comment._links = {
			user: {
				href: `${req.protocol + '://' + req.get('host')}/api/v1/users/${comment.author._id}`
			}
		};

		if (comment.parent_is_post) {
			comment._links.parent = {
				href: `${req.protocol + '://' + req.get('host')}/api/v1/posts/${comment.parent_id}`
			};
		} else {
			comment._links.parent = {
				href: `${req.protocol + '://' + req.get('host')}/api/v1/comments/${comment.parent_id}`
			};
		}

		return res.status(200).json(comment);

	} catch (err) {
		next(err);
	}
});

router.get("/api/v1/comments/:comment_id/likes/:user_id", async function (req, res, next) {
	try {
		let comment = await getCommentById(req.params.comment_id, next);
		if (!comment) throw new NotFoundError(errorMsg.COMMENT_NOT_FOUND);

		return res.status(200).json({
			likes: comment.likes.includes(req.params.user_id)
		});
	} catch (err) {
		next(err);
	}
});
//#endregion

//#region POST
async function postRequest(req, res, next) {
	try {
		if (req.headers["x-http-method-override"]) {
			if (!req.body.id)
				throw new ValidationError(errorMsg.MISSING_ID);
			else
				req.params.id = req.body.id;

			if (req.headers["x-http-method-override"] == "PUT") {
				return await putForId(req, res, next);
			} else if (req.headers["x-http-method-override"] == "PATCH") {
				return await patchForId(req, res, next);
			} else if (req.headers["x-http-method-override"] == "DELETE") {
				return await deleteForId(req, res, next);
			} else {
				throw new ValidationError(errorMsg.UNSUPPORTED);
			}
		}

		if (!req.isAuth || !req.user)
			throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		if (!req.body.parent_id)
			throw new ValidationError(errorMsg.COMMENTS_MUST_HAVE_PARENT_ID);

		let parent = req.body.parent_is_post
			? await models.Posts.findOne({ _id: req.body.parent_id }).exec()
			: await models.Comments.findOne({ _id: req.body.parent_id }).exec();

		if (!parent && req.body.parent_is_post) {
			parent = await models.Comments.findOne({ _id: req.body.parent_id }).exec();
			if (!parent)
				throw new NotFoundError(errorMsg.PARENT_NOT_FOUND);

			req.body.parent_is_post = undefined;
		} else if (!parent) {
			throw new NotFoundError(errorMsg.PARENT_NOT_FOUND);
		}

		let comment = new models.Comments({
			_id: req.params.id, // if called from PUT, it will be specified
			author: req.user.userId,
			content: req.body.content,
			likes: [],
			comments: [],
			images: [],
			parent_id: req.body.parent_id,
			parent_is_post: req.body.parent_is_post
		});

		if (req.files?.length > 0) {
			await updateImages(comment.images, req);
		}

		await comment.save();

		if (parent.comments) {
			parent.comments.push(comment._id);
		} else {
			parent.comments = [comment._id];
		}

		await parent.save();

		return res.status(201).json(comment);

	} catch (err) {
		console.error(err.message);
		next(err);
	}
}

router.post("/api/v1/comments/", authMiddleware, uploadMiddleware.multiple, postRequest);

router.post("/api/v1/comments/:comment_id/likes", authMiddleware, async function (req, res, next) {
	try {
		if (!req.isAuth || !req.user)
			throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		let target = await models.Comments.findOneAndUpdate({ _id: req.params.comment_id },
			{ $addToSet: { likes: req.user.userId }, }, { new: true }
		);
		if (!target)
			throw new NotFoundError(errorMsg.COMMENT_NOT_FOUND);

		return res.status(200).json(target);
	} catch (err) {
		next(err);
	}
});
//#endregion

//#region PUT
async function putForId(req, res, next) {
	try {
		if (!req.isAuth || !req.user)
			throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		let comment = await getCommentById(req.params.id, next);
		if (!comment)
			return postRequest(req, res, next);

		const newData = req.body;
		if (!newData.author || newData.is_edited === undefined || newData.is_deleted === undefined
			|| !newData.content || newData.likes === undefined || newData.comments === undefined
			|| !newData.parent_id || newData.parent_is_post === undefined) {
			throw new ValidationError(errorMsg.MISSING_FIELDS);
		}

		newData.likes = newData.likes || [];
		newData.comments = newData.comments || [];

		Object.assign(comment, newData);
		await updateImages(comment.images, req, comment.images);
		await comment.save();

		return res.status(200).json(comment);

	} catch (err) {
		next(err);
	}
}

router.put("/api/v1/comments/:id", authMiddleware, uploadMiddleware.multiple, putForId);
//#endregion

//#region PATCH
async function patchForId(req, res, next) {
	try {
		let comment = await getCommentById(req.params.id, next);

		if (!comment)
			throw new NotFoundError(errorMsg.COMMENT_NOT_FOUND);

		if (!req.isAuth || comment.author._id != req.user.userId)
			throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		if (comment.is_deleted)
			throw new ValidationError(errorMsg.CANNOT_EDIT_DELETED_COMMENT);

		if (req.body.content === null)
			throw new ValidationError(errorMsg.CANNOT_SET_CONTENT_TO_NULL);

		if (req.body.images === null)
			throw new ValidationError(errorMsg.CANNOT_SET_IMAGES_TO_NULL);

		if (req.body.content === undefined &&
			req.files?.length === 0 &&
			req.body.deletedImages?.length === comment.images?.length)
			throw new ValidationError(errorMsg.CANNOT_REMOVE_BOTH_CONTENT_AND_IMAGES);


		if (req.body.content !== undefined) {
			comment.content = req.body.content;
			comment.is_edited = true;
		}

		if (req.files?.length || req.body.deletedImages?.length) {
			await updateImages(comment.images, req, req.body.deletedImages);
			comment.is_edited = true;
		}

		await comment.save();
		return res.status(200).json(comment);
	} catch (err) {
		next(err);
	}
}

router.patch("/api/v1/comments/:id", authMiddleware, uploadMiddleware.multiple, patchForId);
//#endregion

//#region DELETE
async function deleteForId(req, res, next) {
	try {
		let comment = await getCommentById(req.params.id, next);

		if (!(req.isAuth && comment && comment.author._id == req.user.userId))
			throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		const target = await models.Comments.findById(req.params.id);

		if (target) {
			target.is_deleted = true;
			target.content = null;
			for (var hash of target.images) {
				await removeUsage(hash);
			}
			target.images = null;

			await target.save({ validateBeforeSave: false });
			return res.status(200).json(target);
		} else {
			throw new NotFoundError(errorMsg.COMMENT_NOT_FOUND);
		}
	} catch (err) {
		next(err);
	}
}

router.delete("/api/v1/comments/:id", authMiddleware, deleteForId);

router.delete("/api/v1/comments/:comment_id/likes/:user_id", authMiddleware, async function (req, res, next) {
	try {
		if (!req.isAuth || req.user?.userId != req.params.user_id)
			throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		let target = await models.Comments.findOneAndUpdate({ _id: req.params.comment_id },
			{ $pull: { likes: req.params.user_id } }
		);
		if (!target)
			throw new NotFoundError(errorMsg.COMMENT_NOT_FOUND);

		return res.status(200).json(target);
	} catch (err) {
		next(err);
	}
});
//#endregion

module.exports = router;
