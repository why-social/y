const express = require("express");
const router = express.Router();
const mongoose = require("../db/database").mongoose;
const models = mongoose.models;
const { UnauthorizedError, errorMsg } = require("../utils/errors");
const authMiddleware = require("../middleware/auth");

//#region GET
router.get("/api/v1/feeds/", authMiddleware,
    async function (req, res, next) {
        try {
            if (!req.isAuth || !req.user) {
                throw new UnauthorizedError(errorMsg.UNAUTHORIZED);
            }

            let result = await models.User_follows_user
                .find({ follower: req.user.userId }, { follows: true })
                .exec();

            let following = [];
            result.forEach(entry => {
                following.push(entry.follows);
            });

            if (following.length) {
                result = await models.Posts.aggregate([{
                    $match: {
                        author: { $in: following },
                        $or: [
                            { is_deleted: { $exists: false } },
                            { is_deleted: false }
                        ]
                    }
                }]).exec();

                return res.json(result);
            } else {
                return res.json([]);
            }
        } catch (err) {
            next(err);
        }
    });
//#endregion

module.exports = router;
