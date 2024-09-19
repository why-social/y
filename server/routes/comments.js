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
        try {
            if (validateBody(req, res)) {
                let comment = new models["Comments"](req.body);

                try {
                    await comment.save();

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
    });

router.post("/api/v1/comment/:comment_id/likes/:user_id",
    authMiddleware, async function (req, res) {
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
    });
//#endregion

//#region PATCH
router.patch("/api/v1/comments/:id",
    authMiddleware, async function (req, res) {
        try {
            if (validateBody(req, res)) {
                let target = await models["Comments"]
                    .findOneAndUpdate({ _id: req.params.id },
                        {
                            content: req.body["content"],
                            images: req.body["images"],
                            is_edited: true
                        }
                    );

                if (target) {
                    //TODO also update images table

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
    });
//#endregion

//#region DELETE
router.delete("/api/v1/comments/:id",
    authMiddleware, async function (req, res) {
        try {
            let target = await models["Comments"]
                .deleteOne({ _id: req.params.id });

            if (target && target.acknowledged &&
                target.deletedCount) {
                //TODO also update images table

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
    });

router.delete("/api/v1/comment/:comment_id/likes/:user_id",
    authMiddleware, async function (req, res) {
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

    //TODO validate content and images

    return true;
}
//#endregion

module.exports = router;
