const express = require("express");
const router = express.Router();
const models = require("../db/database").mongoose.models;
const authMiddleware = require("../middleware/auth");

//#region GET
router.get("/api/v1/comments/:id",
    async function (req, res) {
        try {
            let comment = await getCommentById(req.params.id);

            return res.status(200)
                .json(comment);
        } catch (error) {
            return res.status(404)
                .json({ message: error.message });
        }
    });

router.get("/api/v1/comments/user/:id",
    async function (req, res) {
        try {
            let result = await models["Comments"]
                .find({ user: req.params.id }).exec();

            if (!(result && result.length)) {
                return res.status(404)
                    .json({ message: "Not found." });
            }

            return res.status(200)
                .json(result);
        } catch (error) {
            res.status(404);

            if (error.name === 'CastError') {
                res.json({ message: "Malformed user identifier." });
            } else {
                res.json({ message: "Malformed request." });
            }

            return res;
        }
    });

router.get("/api/v1/comment/:comment_id/likes/:user_id",
    async function (req, res) {
        try {
            let comment = await getCommentById(req.params.comment_id);

            return res.status(200)
                .json({
                    likes: comment["likes"]
                        .includes(req.params.user_id)
                });
        } catch (error) {
            return res.status(404)
                .json({ message: error.message });
        }
    });
//#endregion

//#region POST
router.post("/api/v1/comments/",
    authMiddleware, async function (req, res) {
        if (req.isAuth) {
            try {
                if (validateBody(req, res)) {
                    let comment = new models["Comments"](req.body);

                    try {
                        await comment.save();

                        //TODO: update images

                        return res.status(200)
                            .json({ id: comment["_id"] });
                    } catch (error) {
                        return res.status(404)
                            .json({ message: "Malformed request body." })
                    }
                }
            } catch (error) {
                return res.status(404)
                    .json({ message: error.message });
            }
        } else {
            return res.status(401)
                .json({ message: "Unauthorized." });
        }
    });

router.post("/api/v1/comment/:comment_id/likes/:user_id",
    authMiddleware, async function (req, res) {
        if (req.isAuth && req.user == req.params.user_id) {
            try {
                if (validateBody(req, res)) {
                    let target = await models["Comments"]
                        .findOneAndUpdate({ _id: req.params.comment_id },
                            { $push: { likes: req.params.user_id } }
                        );

                    if (target) {
                        return res.status(200)
                            .json({ message: "Successfully updated." });
                    } else {
                        return res.status(404)
                            .json({ message: "Not found." });
                    }
                }
            } catch (error) {
                res.status(404);

                if (error.name === 'CastError') {
                    res.json({ message: "Malformed identifiers or request body." });
                } else {
                    res.json({ message: "Could not update." });
                }

                return res.status(404)
                    .json({ message: error.message });
            }
        } else {
            return res.status(401)
                .json({ message: "Unauthorized." });
        }
    });
//#endregion

//#region PATCH
router.patch("/api/v1/comments/:id",
    authMiddleware, async function (req, res) {
        let comment = getCommentById(req.params.id);

        if (req.isAuth && comment &&
            comment["author"] == req.user) {
            try {
                if (validateBody(req, res)) {
                    let imagesAdded = except(req.body["images"], comment["images"]);
                    let imagesRemoved = except(comment["images"], req.body["images"]);

                    let target = await models["Comments"]
                        .findOneAndUpdate({ _id: req.params.id },
                            {
                                content: req.body["content"],
                                images: req.body["images"],
                                is_edited: true
                            }
                        );

                    if (target) {
                        //TODO update images using imagesAdded and imagesRemoved

                        return res.status(200)
                            .json({ message: "Successfully updated." });
                    } else {
                        return res.status(404)
                            .json({ message: "Not found." });
                    }
                }
            } catch (error) {
                res.status(404);

                if (error.name === 'CastError') {
                    res.json({ message: "Malformed user identifier or request body." });
                } else {
                    res.json({ message: "Could not update." });
                }

                return res.status(404)
                    .json({ message: error.message });
            }
        } else {
            return res.status(401)
                .json({ message: "Unauthorized." });
        }
    });
//#endregion

//#region DELETE
router.delete("/api/v1/comments/:id",
    authMiddleware, async function (req, res) {
        let comment = getCommentById(req.params.id);

        if (req.isAuth && comment &&
            comment["author"] == req.user) {
            try {
                //TODO update images using comment

                let target = await models["Comments"]
                    .deleteOne({ _id: req.params.id });

                if (target && target.acknowledged &&
                    target.deletedCount) {

                    return res.status(200)
                        .json({ message: "Successfully removed." });
                } else {
                    return res.status(404)
                        .json({ message: "Not found." });
                }
            } catch (error) {
                res.status(404);

                if (error.name === 'CastError') {
                    res.json({ message: "Malformed user identifier or request body." });
                } else {
                    res.json({ message: error.message });
                }

                return res;
            }
        } else {
            return res.status(401)
                .json({ message: "Unauthorized." });
        }
    });

router.delete("/api/v1/comment/:comment_id/likes/:user_id",
    authMiddleware, async function (req, res) {
        if (req.isAuth && req.user == req.params.user_id) {
            try {
                if (validateBody(req, res)) {
                    let target = await models["Comments"]
                        .findOneAndUpdate({ _id: req.params.comment_id },
                            { $pull: { likes: req.params.user_id } }
                        );

                    if (target) {
                        return res.status(200)
                            .json({ message: "Successfully updated." });
                    } else {
                        return res.status(404)
                            .json({ message: "Not found." });
                    }
                }
            } catch (error) {
                res.status(404);

                if (error.name === 'CastError') {
                    res.json({ message: "Malformed identifiers or request body." });
                } else {
                    res.json({ message: "Could not update." });
                }

                return res.status(404)
                    .json({ message: error.message });
            }
        } else {
            return res.status(401)
                .json({ message: "Unauthorized." });
        }
    });
//#endregion

//#region Utility
async function getCommentById(id) {
    let result;

    try {
        result = await models["Comments"]
            .findById(id).exec();
    } catch (error) {
        if (error.name === 'CastError') {
            throw new Error("Malformed comment identifier.");
        } else {
            throw new Error("Malformed request.");
        }
    }

    if (!result) {
        throw new Error("Not found.");
    }

    return result;
}

function validateBody(req) {
    if (!(req.body["content"] ||
        (req.body["images"] &&
            req.body["images"].length))) {

        throw new Error("Comment needs to have at least a content string or an image.");
    }

    return true;
}

function except(array, excludes) { // https://stackoverflow.com/a/68575761
    return array.filter((item) => !excludes.includes(item));
}
//#endregion

module.exports = router;
