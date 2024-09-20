const express = require("express");
const router = express.Router();
const mongoose = require("../db/database").mongoose;
const models = mongoose.models;
const authMiddleware = require("../middleware/auth");

//#region GET
router.get("/api/v1/feeds", authMiddleware,
    async function (req, res) {
        if (!req.body.isAuth) {
            return res.status(401)
                .json({ message: "Unauthorized" });
        }

        try {
            let result = await models.User_follows_user
                .find({ follower: req.body.user }, { follows: true })
                .lean().exec();

            if (!result) {
                return res.status(404)
                    .json({ message: "Not found" });
            }

            let following = []// { author "id" }

            await models.Posts.find({
                $or: following,
            })

            return res.json(result);
        } catch (error) {
            if (error.name == 'CastError' ||
                error.name == 'BSONError') {
                return res.status(400)
                    .json({ message: "Malformed authentication token" });
            } else {
                return res.status(500)
                    .json({ message: "Server error" });
            }
        }
    });
//#endregion

module.exports = router;
