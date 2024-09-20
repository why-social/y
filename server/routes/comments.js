const express = require("express");
const router = express.Router();
const mongoose = require("../db/database").mongoose;
const models = mongoose.models;
const authMiddleware = require("../middleware/auth");

//#region GET
router.get("/api/v1/comments/:id",
    async function (req, res) {
        try {
            let comment = await getCommentById(req.params.id);

            return res.status(200)
                .json(comment);
        } catch (error) {
            return handleError(error, res);
        }
    });

router.get("/api/v1/comments/users/:id",
    async function (req, res) {
        try {
            let result;
            let userExists = await models.Users
                .exists({ _id: req.params.id });

            if (userExists) {
                result = await models.Comments
                    .find({ user: req.params.id })
                    .lean().exec();
            } else if (!result) {
                return res.status(404)
                    .json({ message: "Not found" });
            }

            return res.status(200)
                .json({ comments: result });
        } catch (error) {
            return handleError(error, res);
        }
    });

router.get("/api/v1/comments/:comment_id/likes/:user_id",
    async function (req, res) {
        try {
            let comment = await getCommentById(req.params.comment_id);

            return res.status(200)
                .json({
                    likes: comment.likes
                        .includes(req.params.user_id)
                });
        } catch (error) {
            return handleError(error, res);
        }
    });
//#endregion

//#region POST
router.post("/api/v1/comments/",
    authMiddleware, async function (req, res) {
        /*if (!req.body.isAuth || !req.body.user) {
            return res.status(401)
                .json({ message: "Unauthorized" });
        }*/

        try {
            if (!req.body.parent_id) {
                return res.status(400)
                    .json({ message: "Comments must have a parent id." });
            }

            let parent;

            if (req.body.parent_is_post) {
                parent = await models.Posts
                    .findOne({ _id: req.body.parent_id }).exec();

                if (!parent) {
                    parent = await models.Comments
                        .findOne({ _id: req.body.parent_id }).exec();

                    if (!parent) {
                        return res.status(404)
                            .json({ message: "No parent found." });
                    } else {
                        req.body.parent_is_post = undefined;
                    }
                }
            } else {
                parent = await models.Comments
                    .findOne({ _id: req.body.parent_id }).exec();

                if (!parent) {
                    return res.status(404)
                        .json({ message: "No parent found." });
                }
            }

            if (!req.body.content?.length ||
                !req.body.images?.length) {

                let comment = new models.Comments({
                    author: req.body.user,
                    content: req.body.content,
                    images: req.body.images,
                    parent_id: req.body.parent_id,
                    parent_id: req.body.parent_is_post
                });

                await comment.save();

                if(parent.comments) {
                    parent.comments.push(comment._id);
                } else {
                    parent.comments = [comment._id];
                }

                await parent.save();

                //TODO: update images

                return res.status(201)
                    .json({ id: comment._id });
            } else {
                return res.status(400)
                    .json({ message: "At least an image or content is required." })
            }
        } catch (error) {
            console.log(error);

            return handleError(error, res);
        }
    });

router.post("/api/v1/comments/:comment_id/likes/:user_id",
    authMiddleware, async function (req, res) {
        if (req.body.isAuth &&
            req.body.user == req.params.user_id) {
            try {
                let target = await model.Comments
                    .findOneAndUpdate({ _id: req.params.comment_id },
                        { $addToSet: { likes: req.params.user_id } }
                    );

                if (target) {
                    return res.status(201)
                        .json({ message: "Successfully updated" });
                } else {
                    return res.status(404)
                        .json({ message: "Not found" });
                }
            } catch (error) {
                return handleError(error, res);
            }
        } else {
            return res.status(401)
                .json({ message: "Unauthorized" });
        }
    });
//#endregion

//#region PATCH
router.patch("/api/v1/comments/:id",
    authMiddleware, async function (req, res) {
        try {
            let comment = await getCommentById(req.params.id);

            /*if (req.isAuth && comment &&
                comment.author == req.user) {
           
                return res.status(401)
                    .json({ message: "Unauthorized" });
            }*/

            if (comment.is_deleted) {
                return res.status(400)
                    .json({ message: "Cannot edit a deleted comment." })
            }

            if (req.body.content === null) {
                return res.status(400)
                    .json({ message: "Cannot set content to null." })
            }

            if (req.body.images === null) {
                return res.status(400)
                    .json({ message: "Cannot set images to null." })
            }

            let wouldHaveContent = req.body.content == undefined ?
                comment.content?.length : req.body.content?.length;
            let wouldHaveImages = req.body.images == undefined ?
                comment.images?.length : req.body.images?.length;

            if (!wouldHaveContent && !wouldHaveImages) {
                return res.status(400)
                    .json({ message: "Cannot remove both content and images from a comment." })
            }

            //let imagesAdded = except(req.body.images, comment.images);
            //let imagesRemoved = except(comment.images, req.body.images);

            if (req.body.content?.length || wouldHaveImages) {
                comment.content = req.body.content;
            }

            if (req.body.images?.length || wouldHaveContent) {
                comment.images = req.body.images;
            }

            comment.is_edited = true;

            await comment.save();

            //TODO update images using imagesAdded and imagesRemoved

            return res.status(200)
                .json({ message: "Successfully updated" });
        } catch (error) {
            return handleError(error, res);
        }
    });
//#endregion

//#region DELETE
router.delete("/api/v1/comments/:id",
    authMiddleware, async function (req, res) {
        try {
            let comment = await getCommentById(req.params.id);

            /*if (!(req.isAuth && comment &&
                comment.author == req.user)) {
                return res.status(401)
                    .json({ message: "Unauthorized" });
            }*/

            let target = await models.Comments
                .findOneAndUpdate({ _id: req.params.id },
                    {
                        content: null,
                        images: [],
                        is_deleted: true
                    }
                );

            if (target) {
                //TODO remove images

                return res.status(200)
                    .json({ message: "Successfully removed" });
            } else {
                return res.status(404)
                    .json({ message: "Not found" });
            }
        } catch (error) {
            return handleError(error, res);
        }
    });

router.delete("/api/v1/comments/:comment_id/likes/:user_id",
    authMiddleware, async function (req, res) {
        /*if (!req.body.isAuth ||
            req.body.user != req.params.user_id) {
            return res.status(401)
                .json({ message: "Unauthorized" });
        }*/

        try {
            let target = await models.Comments
                .findOneAndUpdate({ _id: req.params.comment_id },
                    { $pull: { likes: req.params.user_id } }
                );

            if (target) {
                return res.status(200)
                    .json({ message: "Successfully updated" });
            } else {
                return res.status(404)
                    .json({ message: "Not found" });
            }
        } catch (error) {
            return handleError(error, res);
        }
    });
//#endregion

//#region Utility
async function getCommentById(id) {
    let result;

    try {
        result = await models.Comments
            .findById(id).exec();
    } catch (error) {
        if (error.name == 'CastError') {
            error = new Error("Malformed comment identifier");
            error.status = 400;

            throw error;
        } else {
            error = new Error("Server error");
            error.status = 500;

            throw error;
        }
    }

    if (!result) {
        let error = new Error("Not found");
        error.status = 404;

        throw error;
    }

    return result;
}

function except(array, excludes) { // https://stackoverflow.com/a/68575761
    return array.filter((item) => !excludes.includes(item));
}

function handleError(error, res) {
    if (error.name == 'CastError' ||
        error.name == 'BSONError') {
        return res.status(400)
            .json({ message: "Malformed identifiers or request body" });
    } else if (error.status) {
        return res.status(error.status)
            .json({ message: error.message });
    } else {
        return res.status(500)
            .json({ message: "Server error" });
    }
}
//#endregion

module.exports = router;
