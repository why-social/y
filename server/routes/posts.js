const express = require("express");
const models = require("../db/database").mongoose.models;
const authMiddleware = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');
const ObjectId = require('mongoose').Types.ObjectId;
const { NotFoundError, UnauthorizedError, ValidationError, errorMsg } = require("../utils/errors");
const { updateImages, removeUsage } = require("../utils/imageHandler");
const { getPublicPathFromHash } = require('../utils/utils')

const router = express.Router();

//#region GET
// Returns a post with id :id
router.get("/api/v1/posts/:id", async function (req, res, next) {
	try {
		const post = await models.Posts.findById(req.params.id)
			.populate({
				path: 'author', select: '_id name username profile_picture',
			}).lean();
		
		// populate profile_picture with the public url to the resource
		if (post.author.profile_picture) {
			post.author.profile_picture = await getPublicPathFromHash(req, post.author.profile_picture);
		}
		
		// populate images with public urls to the resources
		post.images = await Promise.all(
			post.images.map(async image => {
				return await getPublicPathFromHash(req, image);
			})
		);
		
		if (!post)
			throw new NotFoundError(errorMsg.POST_NOT_FOUND);

		post._links = {
			user: {
				href: `${req.protocol + '://' + req.get('host')}/api/v1/users/${post.author._id}`
			}
		};

		if (post.original_post_id) {
			post._links.parent = {
				href: `${req.protocol + '://' + req.get('host')}/api/v1/posts/${post.original_post_id}`
			};
		}

		res.status(200).json(post);
	} catch (err) {
		next(err);
	};
});

// Returns all posts authored by the user with id :id
router.get("/api/v1/posts/users/:id", async function (req, res, next) {
	try {
		const posts = await models.Posts.find({ author: req.params.id }).populate({
			path: 'author', select: '_id name username profile_picture',
		}).lean().exec();

		if (!posts || posts.length == 0)
			throw new NotFoundError(errorMsg.POST_NOT_FOUND);

		if (posts[0].author.profile_picture) {
			posts[0].author.profile_picture = await getPublicPathFromHash(req, posts[0].author.profile_picture);
		} // changes the author pfp in all the posts, since they are reference-shared

		for (var post of posts) {
			post.images = await Promise.all(
				post.images.map(async image => {
					return await getPublicPathFromHash(req, image);
				})
			);
		}	

		res.status(200).json(posts);
	} catch (err) {
		next(err);
	}
});

// returns a boolean representing whether or not a user having :user_id liked a post having :post_id.   
router.get("/api/v1/posts/:post_id/likes/:user_id", authMiddleware, async function (req, res, next) {
	try {
		if (!req.isAuth || !req.user)
			throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		const post = await models.Posts
			.findOne({ _id: req.params.post_id, likes: { $in: [req.params.user_id] } })
			.exec();

		res.status(200).json({ liked: !!post });
	} catch (err) {
		next(err);
	}
});
//#endregion

//#region POST
async function postRequest(req, res, next) {
	try {
		if (!req.isAuth || !req.user)
			throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		const newPost = new models.Posts({
			_id: req.params.id, // if called from PUT, it will be specified
			author: req.user.userId,
			is_edited: false,
			content: req.body.content,
			likes: [],
			comments: [],
			images: [],
		});

		if (req.files?.length > 0) {
			await updateImages(newPost.images, req.files);
		}

		await newPost.save();
		res.status(201).json(newPost);
	}

	catch (error) {
		next(error);
	}
}

router.post("/api/v1/posts/", authMiddleware, uploadMiddleware.multiple, postRequest);

router.post("/api/v1/posts/:post_id/likes/", authMiddleware, async function (req, res, next) {
	try {
		if (!req.isAuth || !req.user)
			throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		const post = await models.Posts
			.findOneAndUpdate({ _id: req.params.post_id }, { $addToSet: { likes: req.user.userId } }, { new: true }) // TODO: different return message when already liked
			.exec();

		if (!post)
			throw new NotFoundError(errorMsg.POST_NOT_FOUND);

		res.status(201).json(post);
	} catch (err) {
		next(err);
	}
});
//#endregion

//#region PUT
router.put("/api/v1/posts/:id", authMiddleware, uploadMiddleware.multiple, async function (req, res, next) {
	try {
		if (!req.isAuth || !req.user)
			throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		let post = await models.Posts.findById(req.params.id).exec();
		if (!post) return postRequest(req, res);

		const newData = req.body;
		if (!newData.author || newData.is_edited === undefined || newData.is_deleted === undefined
			|| !newData.content || newData.likes === undefined || newData.comments === undefined) {
			throw new ValidationError(errorMsg.MISSING_FIELDS);
		}
		
		newData.likes = newData.likes || [];
		newData.comments = newData.comments || [];
		const files = req.files || [];

		Object.assign(post, newData);
		await updateImages(post.images, files);
		await post.save();

		return res.status(200).json(post);
	} catch (err) {
		next(err);
	}
});
//#endregion

//#region PATCH
router.patch("/api/v1/posts/:id", authMiddleware, uploadMiddleware.multiple, async function (req, res, next) {
	try {
		if (!req.isAuth || !req.user)
			throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		if (req.body.content === undefined && req.files?.length === 0) // if not trying to edit only the content and/or images
			throw new ValidationError(errorMsg.NO_CONTENT_FOR_EDITABLE_FIELDS);


		let post = await models.Posts.findById(req.params.id);
		if (!post || post.is_deleted)
			throw new NotFoundError(errorMsg.POST_NOT_FOUND);
		if (post.author.toString() !== req.user?.userId)
			throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		// apply the incoming request to only the editable fields
		if (req.body.content !== undefined) {
			post.content = req.body.content;
			post.is_edited = true;
		}
		if (req.files?.length > 0) {
			await updateImages(post.images, req.files);
			post.is_edited = true;
		}

		await post.save();

		res.status(200).json(post);
	} catch (err) {
		next(err);
	}
});
//#endregion

//#region DELETE
router.delete("/api/v1/posts/:id", authMiddleware, async function (req, res, next) {
	try {
		if (!req.isAuth || !req.user)
			throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		const post = await models.Posts.findById(req.params.id).exec();
		if (!post)
			throw new NotFoundError(errorMsg.POST_NOT_FOUND);
		if (post.author.toString() !== req.user?.userId)
			throw new UnauthorizedError(errorMsg.UNAUTHORIZED);
		if (post.is_deleted)
			throw new ValidationError(errorMsg.POST_IS_DELETED);

		post.is_deleted = true;
		post.content = null;

		for (var hash of post.images) {
			await removeUsage(hash);
		}
		post.images = null;

		await post.save({ validateBeforeSave: false });

		res.status(200).json(post);
	} catch (err) {
		next(err);
	}
});

router.delete("/api/v1/posts/:post_id/likes/:user_id", authMiddleware, async function (req, res, next) {
	try {
		if (!req.isAuth || req.user?.userId != req.params.user_id)
			throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		const post = await models.Posts.findById(req.params.post_id);
		if (!post)
			throw new NotFoundError(errorMsg.POST_NOT_FOUND);

		const index = post.likes.indexOf(new ObjectId(req.params.user_id));
		if (index == -1)
			throw new NotFoundError(errorMsg.POST_NOT_LIKED);
		post.likes.splice(index, 1);

		await post.save();

		res.status(200).json(post);
	} catch (err) {
		next(err);
	}

});
//#endregion

module.exports = router;