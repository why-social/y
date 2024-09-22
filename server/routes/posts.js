const express = require("express");
const models = require("../db/database").mongoose.models;
const authMiddleware = require('../middleware/auth');
const { uploadFiles } = require('../middleware/upload');
const ObjectId = require('mongoose').Types.ObjectId;
const { NotFoundError, UnauthorizedError, ValidationError, errorMsg } = require("../utils/errors");
const { except } = require("../utils/utils");
const { updateImages, removeUsage } = require("../utils/imageHandler");

const router = express.Router();

//#region GET
// Returns a post with id :id
router.get("/api/v1/posts/:id", async function (req, res, next) {
	try{
		const post = await models.Posts.findById(req.params.id).populate('comments').lean().exec();
		if(!post)
			throw new NotFoundError(errorMsg.POST_NOT_FOUND);

		post._links = {
			user: {
				href: `${req.protocol + '://' + req.get('host')}/api/v1/users/${post.author}`
			}
		};

		if (post.original_post_id) {
			post._links.parent = {
				href: `${req.protocol + '://' + req.get('host')}/api/v1/posts/${post.original_post_id}`
			};
		}

		res.status(200).json(post);
	} catch(err) {
		next(err);
	};
});

// Returns all posts authored by the user with id :id
router.get("/api/v1/posts/users/:id", async function (req, res, next) {
    try {
        const posts = await models.Posts.find({ author: req.params.id }).populate('comments').exec();
        if (!posts || posts.length == 0)
			throw new NotFoundError(errorMsg.POST_NOT_FOUND);    

        res.status(200).json(posts);
    } catch (err) {
        next(err);
    }
});

// returns a boolean representing whether or not a user having :user_id liked a post having :post_id.   
router.get("/api/v1/posts/:post_id/likes/:user_id", authMiddleware, async function (req, res, next) {
	try{
		if (!req.isAuth || !req.user)
			throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		const post = await models.Posts
			.findOne({ _id: req.params.post_id, likes: { $in: [req.params.user_id] }})
			.exec();
		
		res.status(200).json({ liked: !!post });
	} catch(err) {
		next(err);
	}
});
//#endregion

//#region POST
async function postRequest(req, res, next) {
	try{
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
            await updateImages(newPost, req.files);
        }

        await newPost.save();
        res.status(201).json(newPost);
    }

    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: error.message });
        }
        else if (error.name === 'CastError') {
            // invalid ObjectId
            res.status(400).json({ message: 'Invalid ObjectId: ' + error.message });
        }
        else {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    }
}

router.post("/api/v1/posts/", authMiddleware, uploadFiles, postRequest);

router.post("/api/v1/posts/:post_id/likes/:user_id", async function (req, res, next) {
    try {
        const post = await models.Posts
            .findOneAndUpdate({ _id: req.params.post_id }, { $addToSet: { likes: req.params.user_id } }, { new: true }) // TODO: different return message when already liked
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
router.put("/api/v1/posts/:id", authMiddleware, uploadFiles, async function (req, res, next) {
	try {
		if (!req.isAuth || !req.user)
			throw new UnauthorizedError(errorMsg.UNAUTHORIZED);

		let post = await models.Posts.findById(req.params.id).exec();
        if(!post) return postRequest(req, res);

		if (post.is_deleted)
			throw new ValidationError(errorMsg.CANNOT_EDIT_DELETED_COMMENT);

		if (req.body.is_deleted)
			throw new ValidationError(errorMsg.DELETE_COMMENTS_ONLY);

		if (!req.body.is_edited)
			throw new ValidationError(errorMsg.EDITED_POSTS_NEED_IS_EDITED_TRUE);

		if (req.body.author && req.body.author != post.author)
			throw new ValidationError(errorMsg.CANNOT_CHANGE_AUTHOR);

		if (req.body.timestamp && req.body.timestamp != post.timestamp)
			throw new ValidationError(errorMsg.CANNOT_CHANGE_TIMESTAMP);

		if (req.body.original_post_id && req.body.original_post_id != post.original_post_id)
			throw new ValidationError(errorMsg.CANNOT_CHANGE_PARENT_ID);

		if (req.body.likes) {
			let likesDiff = except(req.body.likes, post.likes);

			if (likesDiff.length == 0) {
				likesDiff = except(post.likes, req.body.likes);
			}

			if (likesDiff.length > 0 && (likesDiff.length > 1 || likesDiff[0] != req.user))
				throw new ValidationError(errorMsg.CANNOT_CHANGE_OTHER_USERS_LIKES);
		}

		if (req.body.content?.length || req.body.images?.length) {

			post.is_edited = true;
			post.content = req.body.content;
			post.likes = req.body.likes;

            if (req.files?.length > 0) {
                updateImages(post, req.files);
            } else {
                updateImages(post, []);
            }
            

			await post.save();

			return res.status(200).json(post);
		} else {
			throw new ValidationError(errorMsg.AT_LEAST_IMAGE_OR_CONTENT_REQUIRED);
		}
	} catch (err) {
		next(err);
	}
});
//#endregion

//#region PATCH
router.patch("/api/v1/posts/:id", authMiddleware, uploadFiles, async function (req, res, next) {
	try{
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
			await updateImages(post, req.files);
			post.is_edited = true;
		}

		await post.save();

		res.status(200).json(post);
	} catch(err) {
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
		if (!req.isAuth || !req.user)
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