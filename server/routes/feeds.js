const express = require("express");
const router = express.Router();
const mongoose = require("../db/database").mongoose;
const models = mongoose.models;
const { ValidationError, UnauthorizedError, errorMsg } = require("../utils/errors");
const authMiddleware = require("../middleware/auth");

//#region GET
router.get("/api/v1/feeds/", authMiddleware,
    async function (req, res, next) {
        try {
            if (!req.isAuth || !req.user) {
                throw new UnauthorizedError(errorMsg.UNAUTHORIZED);
            }

            let limit = 10;
            let pageNumber = 1;

            if (req.query?.page) {
                if (req.query.page < 1) {
                    throw new ValidationError("Page parameter has to be a number greater than 0.")
                } else {
                    pageNumber = req.query.page;
                }
            }

            let sorting = 1;

            if (req.query?.sort) {
                if (req.query.sort !== "asc" && req.query.sort !== "desc") {
                    throw new ValidationError("Only ascending ('asc') and descending ('desc') sorting is supported.")
                } else {
                    sorting = req.query.sort == "asc" ? 1 : -1;
                }
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
                    },
                },
                {
                    $sort: {
                        timestamp: sorting
                    }
                },
                {
                    $facet: {
                        metadata: [{ $count: "total" }, { $addFields: { page: pageNumber } }],
                        data: [{ $skip: (pageNumber - 1) * limit }, { $limit: limit }]
                    }
                }]).exec();

                if (result && result.length &&
                    result[0] && result[0].data) {
                    result = {
                        posts: result[0].data
                    };

                    if (result.posts.length == limit) {
                        result._links = {
                            next: {
                                href: `${req.protocol + '://' + req.get('host')}/api/v1/feeds/?page=${pageNumber + 1}`
                            }
                        };
                    }

                    console.log(result);

                    return res.json(result);
                } else {
                    return res.json({
                        posts: []
                    });
                }
            } else {
                return res.json({
                    posts: []
                });
            }
        } catch (err) {
            next(err);
        }
    });
//#endregion

module.exports = router;
