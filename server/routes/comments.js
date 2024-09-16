const express = require("express");
const router = express.Router();
const http = require("http");
const models = require("../db/createDB").mongoose.models;
const authMiddleware = require("../middleware/auth");

//#region GET
router.get("/api/v1/comments/:id",
    async function (req, res) {
        let obj = await getCommentById(req.params.id);

        return res.status(obj["status"])
            .json(obj["body"]);
    });

router.get("/api/v1/comments/:id/images/",
    async function (req, res) {
        let obj = await getCommentById(req.params.id);

        if (obj["status"] != 200) {
            return res.status(obj["status"])
                .json(obj["body"]);
        } else {
            return res.status(200)
                .json({
                    images: obj["body"]["images"]
                });
        }
    });

router.get("/api/v1/comments/user/:id",
    async function (req, res) {
        try {
            let result = await models["Comments"]
                .find({ user: req.params.id }).exec();

            if (!result) {
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
        let obj = await getCommentById(req.params.comment_id);

        if (obj["status"] != 200) {
            return res.status(obj["status"])
                .json(obj["body"]);
        } else {
            return res.status(200)
                .json({
                    likes: obj["body"]["likes"]
                        .includes(req.params.user_id)
                });
        }
    });
//#endregion

//#region POST
router.post("/api/v1/comments/",
    authMiddleware, async function (req, res) {
        res = validateBody(req, res);

        if (res.statusCode == 404) {
            return res;
        }

        let comment = new models["Comments"](req.body);

        try {
            await comment.save();

            //TODO also update images table

            return res.status(200)
                .json({ id: comment["_id"] });
        } catch (error) {
            return res.status(404)
                .json({ message: "Malformed request body." })
        }
    });
//#endregion

//#region PATCH
router.patch("/api/v1/comments/:id",
    authMiddleware, async function (req, res) {
        try {
            res = validateBody(req, res);

            if (res.statusCode == 404) {
                return res;
            }

            let target = await models["Comments"]
                .findOneAndUpdate({ _id: req.params.id },
                    {
                        content: req.body["content"],
                        images: req.body["images"],
                        is_edited: true
                    }
                );

            console.log(target);

            if (target) {
                //TODO also update images table

                return res.status(200)
                    .json({ message: "Successfully updated." });
            } else {
                return res.status(404)
                    .json({ message: "Not found." });
            }
        } catch (error) {
            res.status(404);

            if (error.name === 'CastError') {
                res.json({ message: "Malformed user identifier or request body." });
            } else {
                res.json({ message: "Could not update." });
            }

            return res;
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
                res.json({ message: "Malformed user identifier." });
            } else {
                res.json({ message: "Could not remove." });
            }

            return res;
        }
    });
//#endregion

//#region Utility
async function getCommentById(id) {
    try {
        let result = await models["Comments"]
            .findById(id).exec();

        if (!result) {
            return {
                status: 404,
                body: { message: "Not found." }
            }
        }

        return {
            status: 200,
            body: result
        };
    } catch (error) {
        let res = {
            status: 404
        };

        if (error.name === 'CastError') {
            res["body"] = { message: "Malformed comment identifier." };
        } else {
            res["body"] = { message: "Malformed request." };
        }

        return res;
    }
}

function validateBody(req, res) {
    if (!(req.body["content"] ||
        (req.body["images"] &&
            req.body["images"].length))) {
        return res.status(404)
            .json({ message: "Comment needs to have at least a content string or an image." });
    }

    //TODO validate content and images

    return res;
}
//#endregion

module.exports = router;
